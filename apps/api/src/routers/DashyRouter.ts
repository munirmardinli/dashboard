import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();
const DASHY_FILE_PATH = "management/dashy.json";

export class DashyRouter {
	private async getData(): Promise<DashyData> {
		const { content } = await github.getFile(DASHY_FILE_PATH);
		return JSON.parse(content) as DashyData;
	}

	private async save(data: DashyData): Promise<void> {
		await github.updateFile(DASHY_FILE_PATH, JSON.stringify(data, null, "\t"), "Update dashy");
	}

	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/dashy$/, handler: this.get.bind(this) },
			{ method: "POST", path: /^\/api\/dashy\/sections\/(?<sectionId>[^/]+)\/items$/, handler: this.addItem.bind(this) },
			{ method: "PUT", path: /^\/api\/dashy\/sections\/(?<sectionId>[^/]+)\/items\/(?<itemIndex>[^/]+)$/, handler: this.updateItem.bind(this) },
			{ method: "DELETE", path: /^\/api\/dashy\/sections\/(?<sectionId>[^/]+)\/items\/(?<itemIndex>[^/]+)$/, handler: this.archiveItem.bind(this) },
		];
	}

	async get(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		sendJSON(res, await this.getData());
	}

	async addItem(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DashyRouteParams;
		const data = await this.getData();
		const section = data.sections.find((s) => s.id === params.sectionId);
		if (!section) throw new Error("Section not found");

		const newItem = ctx.body as DashyItem;
		section.items.push(newItem);
		await this.save(data);
		sendJSON(res, newItem, 201);
	}

	async updateItem(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DashyRouteParams;
		const data = await this.getData();
		const section = data.sections.find((s) => s.id === params.sectionId);
		const index = parseInt(params.itemIndex || "", 10);
		if (!section || isNaN(index) || !section.items[index]) throw new Error("Invalid params");

		section.items[index] = { ...section.items[index], ...(ctx.body as Partial<DashyItem>) } as DashyItem;
		await this.save(data);
		sendJSON(res, section.items[index]);
	}

	async archiveItem(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DashyRouteParams;
		const data = await this.getData();
		const section = data.sections.find((s) => s.id === params.sectionId);
		const index = parseInt(params.itemIndex || "", 10);
		if (!section || isNaN(index) || !section.items[index]) throw new Error("Invalid params");

		section.items[index] = { ...section.items[index], isArchive: true, updatedAt: new Date().toISOString() } as DashyItem;
		await this.save(data);
		sendJSON(res, { success: true });
	}
}
