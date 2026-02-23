import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { ReceiptService } from "./ReceiptService.js";

const service = new ReceiptService();

export class ReceiptRouter {
	getRoutes(): Route[] {
		return [{ method: "POST", path: /^\/api\/receipt\/analyze$/, handler: this.post.bind(this) }];
	}

	async post(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const body = ctx.body as { image: string };
		sendJSON(res, await service.analyze(body.image));
	}
}
