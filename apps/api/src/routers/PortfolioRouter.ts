import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON, sendImage } from "../utils/http.js";
import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();
const PORTFOLIO_DIR = "portfolio/index.json";

export class PortfolioRouter {
	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/portfolio$/, handler: this.get.bind(this) },
			{ method: "GET", path: /^\/api\/portfolio\/(?<filename>[^/]+)$/, handler: this.getImage.bind(this) },
		];
	}

	async get(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		const { content } = await github.getFile(PORTFOLIO_DIR);
		sendJSON(res, JSON.parse(content));
	}

	async getImage(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as FilenameRouteParams;
		const filename = params.filename;
		if (!filename) throw new Error("Filename missing");
		const { content } = await github.getRawFile(`${PORTFOLIO_DIR}/${filename}`);
		const ext = filename.split(".").pop()?.toLowerCase() || "";
		const mime: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };
		sendImage(res, content, mime[ext] || "application/octet-stream");
	}
}
