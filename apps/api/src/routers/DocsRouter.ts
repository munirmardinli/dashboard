import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { DocsService } from "./DocsService.js";

const service = new DocsService();

export class DocsRouter {
	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/docs\/meta$/, handler: this.getMeta.bind(this) },
			{ method: "GET", path: /^\/api\/docs\/content$/, handler: this.getContent.bind(this) },
			{ method: "GET", path: /^\/api\/docs\/assets\/images(?:\/(?<subPath>.*))?$/, handler: this.getImage.bind(this) },
			{ method: "GET", path: /^\/api\/docs\/assets\/pdf(?:\/(?<subPath>.*))?$/, handler: this.getPDF.bind(this) },
		];
	}

	async getMeta(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		sendJSON(res, await service.getMeta());
	}

	async getContent(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const p = ctx.query["p"] || "index";
		res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		res.end(await service.getContent(p));
	}

	async getImage(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DocsRouteParams;
		const sub = params.subPath || "";
		const file = ctx.query["p"];
		if (!file) throw new Error("File path missing");
		const { content } = await service.getAsset(`images/${sub ? sub + "/" + file : file}`);
		const ext = file.split(".").pop()?.toLowerCase() || "";
		const mime: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp" };
		res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
		res.end(content);
	}

	async getPDF(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DocsRouteParams;
		const sub = params.subPath || "";
		const file = ctx.query["p"];
		if (!file) throw new Error("File path missing");
		const { content } = await service.getAsset(`pdf/${sub ? sub + "/" + file : file}`);
		res.writeHead(200, { "Content-Type": "application/pdf" });
		res.end(content);
	}
}
