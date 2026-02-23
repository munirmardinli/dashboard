import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { GeminiService } from "./GeminiService.js";

const service = new GeminiService();

export class GeminiRouter {
	getRoutes(): Route[] {
		return [{ method: "POST", path: /^\/api\/gemini$/, handler: this.post.bind(this) }];
	}

	async post(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const body = ctx.body as { prompt: string; options?: Record<string, unknown> };
		sendJSON(res, await service.call(body.prompt, body.options || {}));
	}
}
