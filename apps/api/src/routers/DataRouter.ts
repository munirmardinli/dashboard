import { Router, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();

class DataRouter {
	getRouter(): Router {
		const router = Router();

		router.get("/api/data/:dataType(*)/findonly/:id", this.findonly.bind(this));
		router.get("/api/data/:dataType(*)", this.getAll.bind(this));

		router.post("/api/data/:dataType(*)", this.create.bind(this));
		router.put("/api/data/:dataType(*)/:id", this.update.bind(this));
		router.delete("/api/data/:dataType(*)/:id", this.archive.bind(this));

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

		let items = (await this.getItems<GenericItem>(dataType)).filter(item => !item.isArchive);

		if (search) {
			const term = search.toLowerCase();
			items = items.filter(item => 
				Object.values(item).some(val => 
					String(val).toLowerCase().includes(term)
				)
			);
		}

		if (sortField) {
			items.sort((a: any, b: any) => {
				const valA = a[sortField];
				const valB = b[sortField];

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
		const items = await this.getItems<GenericItem>(dataType);
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


	private async getConfig(): Promise<DashboardConfig> {
		const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de";
		const { content } = await github.getFile(`${lang}.json`);
		return JSON.parse(content) as DashboardConfig;
	}

	private async getItems<T extends GenericItem>(dataType: string): Promise<T[]> {
		const config = await this.getConfig();
		const path = config.dataTypes[dataType]?.filePath;
		if (!path) return [];

		try {
			const { content } = await github.getFile(path);
			return JSON.parse(content) as T[];
		} catch {
			return [];
		}
	}

	private async saveItems(dataType: string, items: unknown[]): Promise<void> {
		const config = await this.getConfig();
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
			id: item.id || `item-${Date.now()}`,
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
