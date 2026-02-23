import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class RandomPieRouter {
	getRoutes(): Route[] {
		return [{ method: "GET", path: /^\/api\/randomPie$/, handler: this.get.bind(this) }];
	}

	async get(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		const { content } = await github.getFile("learn/randomPie.json");
		sendJSON(res, JSON.parse(content));
	}
}
