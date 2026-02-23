import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class BlogRouter {
	getRoutes(): Route[] {
		return [{ method: "GET", path: /^\/api\/blog$/, handler: this.get.bind(this) }];
	}

	async get(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		const { content } = await github.getFile("blog/blog.json");
		sendJSON(res, JSON.parse(content));
	}
}
