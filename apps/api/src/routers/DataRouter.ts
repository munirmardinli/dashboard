import { randomUUID } from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();

class DataRouter {
	getRouter(): Router {
		const router = Router();

		const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => 
			(req: Request, res: Response, next: NextFunction) => {
				Promise.resolve(fn(req, res)).catch(next);
			};
		router.get("/api/data/:dataType(*)/findonly/:id", asyncHandler(this.findonly.bind(this)));
		router.get("/api/data/:dataType(*)", asyncHandler(this.getAll.bind(this)));
		router.post("/api/data/:dataType(*)", asyncHandler(this.create.bind(this)));
		router.put("/api/data/:dataType(*)/:id", asyncHandler(this.update.bind(this)));
		router.delete("/api/data/:dataType(*)/:id", asyncHandler(this.archive.bind(this)));

		return router;
	}

	async getAll(req: Request, res: Response): Promise<void> {
		const { dataType = "" } = req.params;
		const { 
			page = "1", 
			limit = "10", 
			search = "", 
			sortField = "", 
			sortOrder = "asc" 
		} = req.query as Record<string, string>;
		
		const p = parseInt(page);
		const l = parseInt(limit);
		const offset = (p - 1) * l;

		const resolved = await this.resolveConfig();
		if (!resolved.ok) {
			res.status(503).json({
				error: resolved.error,
				items: [],
				total: 0,
				page: p,
				limit: l,
				totalPages: 0,
			});
			return;
		}
		const config = resolved.config;

		let items = (await this.getItemsWithConfig<GenericItem>(config, dataType)).filter(item => !item.isArchive);

		if (search) {
			const term = search.toLowerCase();
			items = items.filter(item => 
				Object.values(item).some(val => 
					String(val).toLowerCase().includes(term)
				)
			);
		}

		if (sortField) {
			items.sort((a: GenericItem, b: GenericItem) => {
				const valA = (a as Record<string, unknown>)[sortField];
				const valB = (b as Record<string, unknown>)[sortField];

				if (valA === valB) return 0;
				if (valA === undefined || valA === null) return 1;
				if (valB === undefined || valB === null) return -1;

				const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
				return sortOrder === 'desc' ? -comparison : comparison;
			});
		}

		const total = items.length;
		const paginated = items.slice(offset, offset + l);

		res.json({
			items: paginated,
			total,
			page: p,
			limit: l,
			totalPages: Math.ceil(total / l)
		});
	}

	async findonly(req: Request, res: Response): Promise<void> {
		const { dataType = "", id = "" } = req.params;
		const resolved = await this.resolveConfig();
		if (!resolved.ok) {
			res.status(503).json({ error: resolved.error });
			return;
		}
		const config = resolved.config;
		const items = await this.getItemsWithConfig<GenericItem>(config, dataType);
		const item = items.find(it => it.id === id);
		
		if (!item) {
			res.status(404).json({ error: "Item not found" });
			return;
		}
		
		res.json(item);
	}


	async create(req: Request, res: Response): Promise<void> {

		const { dataType = "" } = req.params;
		const item = await this.createItem(dataType, req.body as Record<string, unknown>);
		res.status(201).json(item);
	}

	async update(req: Request, res: Response): Promise<void> {
		const { dataType = "", id = "" } = req.params;
		const item = await this.updateItem(dataType, id, req.body as Record<string, unknown>);
		res.json(item);
	}

	async archive(req: Request, res: Response): Promise<void> {
		const { dataType = "", id = "" } = req.params;
		await this.archiveItem(dataType, id);
		res.json({ success: true });
	}


	/**
	 * Lokal: .env mit GITHUB_* → ok. Production (Docker/Synology): dieselben Variablen
	 * als Container-Umgebung setzen — im Dockerfile sind OWNER/REPO/TOKEN standardmäßig leer.
	 */
	private async resolveConfig(): Promise<
		{ ok: true; config: DashboardConfig } | { ok: false; error: string }
	> {
		const token = process.env.GITHUB_TOKEN?.trim() ?? "";
		const owner = process.env.GITHUB_OWNER?.trim() ?? "";
		const repo = process.env.GITHUB_REPO?.trim() ?? "";
		if (!token || !owner || !repo) {
			return {
				ok: false,
				error:
					".env file is not configured correctly",
			};
		}
		const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de";
		try {
			const { content } = await github.getFile(`${lang}.json`);
			return { ok: true, config: JSON.parse(content) as DashboardConfig };
		} catch (e) {
			const branch = process.env.GITHUB_BRANCH?.trim() || "main";
			const raw = e instanceof Error ? e.message : String(e);
			console.error("❌ DataRouter: Konfiguration (GitHub) nicht ladbar:", e);

			if (raw.includes("404") || raw.toLowerCase().includes("not found")) {
				return {
					ok: false,
					error: `GitHub: ${lang}.json not found on branch "${branch}" (404).`,
				};
			}
			if (raw.includes("403")) {
				return {
					ok: false,
					error:
						"GitHub: 403 — Token braucht repo-Zugriff oder Repo/Owner stimmt nicht.",
				};
			}
			if (raw.includes("ENOTFOUND") || raw.includes("fetch failed")) {
				return {
					ok: false,
					error:
						"Netzwerk: api.github.com vom Server nicht erreichbar (DNS/Firewall, z. B. Synology).",
				};
			}

			return {
				ok: false,
				error: `GitHub: ${raw} (Branch ref=${branch}).`,
			};
		}
	}

	private async getConfig(): Promise<DashboardConfig | null> {
		const r = await this.resolveConfig();
		return r.ok ? r.config : null;
	}

	private async getItemsWithConfig<T extends GenericItem>(
		config: DashboardConfig,
		dataType: string
	): Promise<T[]> {
		const path = config.dataTypes[dataType]?.filePath;
		if (!path) return [];

		try {
			const { content } = await github.getFile(path);
			return JSON.parse(content) as T[];
		} catch {
			return [];
		}
	}

	private async getItems<T extends GenericItem>(dataType: string): Promise<T[]> {
		const config = await this.getConfig();
		if (!config) return [];
		return this.getItemsWithConfig<T>(config, dataType);
	}

	private async saveItems(dataType: string, items: unknown[]): Promise<void> {
		const resolved = await this.resolveConfig();
		if (!resolved.ok) {
			throw new Error(resolved.error);
		}
		const config = resolved.config;
		const path = config.dataTypes[dataType]?.filePath;

		if (path) {
			await github.updateFile(
				path,
				JSON.stringify(items, null, 2),
				`Update ${dataType}`
			);
		}
	}

	private async createItem<T extends GenericItem>(dataType: string, item: Partial<T>): Promise<T> {
		const items = await this.getItems<T>(dataType);

		const newItem = {
			...item,
			id: item.id || randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			isArchive: false
		} as T;

		await this.saveItems(dataType, [...items, newItem]);
		return newItem;
	}

	private async updateItem<T extends GenericItem>(
		dataType: string,
		id: string,
		updates: Partial<T>
	): Promise<T | undefined> {
		const items = await this.getItems<T>(dataType);

		const updated = items.map(it =>
			it.id === id
				? { ...it, ...updates, updatedAt: new Date().toISOString() }
				: it
		) as T[];

		await this.saveItems(dataType, updated);
		return updated.find(it => it.id === id);
	}

	private async archiveItem(dataType: string, id: string): Promise<unknown> {
		return this.updateItem<GenericItem>(dataType, id, { isArchive: true });
	}
}

export { DataRouter }
