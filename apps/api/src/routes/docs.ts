import { DocsService } from "../services/docsService.js";
import { sendError } from "../utils/http.js";

const docsService = DocsService.getInstance();

export const docsRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/docs\/meta$/,
		handler: async (_req, res) => {
			try {
				const meta = await docsService.getMeta();
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify(meta));
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Internal server error");
			}
		},
	},
	{
		method: "GET",
		path: /^\/api\/docs\/content$/,
		handler: async (_req, res, ctx) => {
			try {
				const p = ctx.query["p"] || "index";
				const content = await docsService.getContent(p);
				res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
				res.end(content);
			} catch (error) {
				sendError(res, 404, error instanceof Error ? error.message : "Documentation not found");
			}
		},
	},
	{
		method: "GET",
		path: /^\/api\/docs\/assets\/images$/,
		handler: async (_req, res, ctx) => {
			try {
				const p = ctx.query["p"];
				if (!p) throw new Error("Missing file path");

				const { content } = await docsService.getAsset(`images/${p}`);
				const ext = p.split(".").pop()?.toLowerCase();
				const mimeMap: Record<string, string> = {
					png: "image/png",
					jpg: "image/jpeg",
					jpeg: "image/jpeg",
					gif: "image/gif",
					svg: "image/svg+xml",
					webp: "image/webp",
				};

				res.writeHead(200, { "Content-Type": mimeMap[ext || ""] || "image/png" });
				res.end(content);
			} catch (error) {
				sendError(res, 404, error instanceof Error ? error.message : "Image not found");
			}
		},
	},
	{
		method: "GET",
		path: /^\/api\/docs\/assets\/pdf$/,
		handler: async (_req, res, ctx) => {
			try {
				const p = ctx.query["p"];
				if (!p) throw new Error("Missing file path");

				const { content } = await docsService.getAsset(`pdf/${p}`);
				res.writeHead(200, { "Content-Type": "application/pdf" });
				res.end(content);
			} catch (error) {
				sendError(res, 404, error instanceof Error ? error.message : "PDF not found");
			}
		},
	},
];
