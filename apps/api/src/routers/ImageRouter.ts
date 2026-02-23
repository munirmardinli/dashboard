import type { IncomingMessage, ServerResponse } from "node:http";
import { sendImage } from "../utils/http.js";
import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class ImageRouter {
	getRoutes(): Route[] {
		return [{ method: "GET", path: /^\/api\/portfolio\/(?<filepath>(?:[\w-]+\/){0,2}[\w-]+\.(jpg|jpeg|png|gif|webp|svg))$/i, handler: this.get.bind(this) }];
	}

	async get(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as ImageRouteParams;
		const filepath = params.filepath;
		if (!filepath) throw new Error("Filepath missing");
		const { content } = await github.getRawFile(`portfolio/${filepath}`);
		const ext = filepath.split(".").pop()?.toLowerCase() || "";
		const mime: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };
		sendImage(res, content, mime[ext] || "application/octet-stream");
	}
}
