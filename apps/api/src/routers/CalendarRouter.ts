import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON, sendICS } from "../utils/http.js";
import { CalendarService } from "./CalendarService.js";

const service = new CalendarService();

export class CalendarRouter {
	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/calendar$/, handler: async (_req: IncomingMessage, res: ServerResponse) => sendJSON(res, { status: "ok" }) },
			{ method: "GET", path: /^\/api\/ics\/(?<calendarName>[^/]+)\.ics$/, handler: this.getICS.bind(this) },
		];
	}

	async getICS(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as CalendarRouteParams;
		sendICS(res, await service.getICal(params.calendarName || ""));
	}
}
