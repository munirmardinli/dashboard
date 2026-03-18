import type { IncomingMessage, ServerResponse } from "node:http";
import { GitHubService } from "../utils/github.js";
import { sendJSON } from "../utils/http.js";

const github = new GitHubService();

export class DataRouter {
	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/data\/(?<dataType>[a-zA-Z0-9-/]+)$/, handler: this.getAll.bind(this) },
			{ method: "POST", path: /^\/api\/data\/(?<dataType>[a-zA-Z0-9-/]+)$/, handler: this.create.bind(this) },
			{ method: "PUT", path: /^\/api\/data\/(?<dataType>[a-zA-Z0-9-/]+)\/(?<id>[^/]+)$/, handler: this.update.bind(this) },
			{ method: "DELETE", path: /^\/api\/data\/(?<dataType>[a-zA-Z0-9-/]+)\/(?<id>[^/]+)$/, handler: this.archive.bind(this) },
		];
	}

	async getAll(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const { dataType = "" } = ctx.params as DataRouteParams;
		const items = await this.getItems(dataType);
		sendJSON(res, items);
	}

	async create(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const { dataType = "" } = ctx.params as DataRouteParams;
		const item = await this.createItem(dataType, ctx.body as Record<string, unknown>);
		sendJSON(res, item, 201);
	}

	async update(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const { dataType = "", id = "" } = ctx.params as DataRouteParams;
		const item = await this.updateItem(dataType, id, ctx.body as Record<string, unknown>);
		sendJSON(res, item);
	}

	async archive(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const { dataType = "", id = "" } = ctx.params as DataRouteParams;
		await this.archiveItem(dataType, id);
		sendJSON(res, { success: true });
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
