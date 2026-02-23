import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { DataService } from "./DataService.js";

const dataService = new DataService();

export class DataRouter {
	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/data\/(?<dataType>[^/]+)$/, handler: this.getAll.bind(this) },
			{ method: "POST", path: /^\/api\/data\/(?<dataType>[^/]+)$/, handler: this.create.bind(this) },
			{ method: "PUT", path: /^\/api\/data\/(?<dataType>[^/]+)\/(?<id>[^/]+)$/, handler: this.update.bind(this) },
			{ method: "DELETE", path: /^\/api\/data\/(?<dataType>[^/]+)\/(?<id>[^/]+)$/, handler: this.archive.bind(this) },
		];
	}

	async getAll(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DataRouteParams;
		sendJSON(res, await dataService.getItems(params.dataType || ""));
	}

	async create(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DataRouteParams;
		sendJSON(res, await dataService.createItem(params.dataType || "", ctx.body as Record<string, unknown>), 201);
	}

	async update(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DataRouteParams;
		sendJSON(res, await dataService.updateItem(params.dataType || "", params.id || "", ctx.body as Record<string, unknown>));
	}

	async archive(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DataRouteParams;
		await dataService.archiveItem(params.dataType || "", params.id || "");
		sendJSON(res, { success: true });
	}
}
