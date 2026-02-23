import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";

export class SchedulerRouter {
	getRoutes(): Route[] {
		return [{ method: "GET", path: /^\/api\/scheduler$/, handler: async (_req: IncomingMessage, res: ServerResponse) => sendJSON(res, { message: "Scheduler routes - coming soon" }) }];
	}
}
