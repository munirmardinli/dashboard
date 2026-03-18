import type { IncomingMessage, ServerResponse } from "node:http";
import createCalendar from "ical-generator";
import { GitHubService } from "../utils/github.js";
import { sendJSON, sendICS } from "../utils/http.js";

const github = new GitHubService();

export class CalendarRouter {
	getRoutes(): Route[] {
		return [
			{
				method: "GET",
				path: /^\/api\/calendar$/,
				handler: async (_req: IncomingMessage, res: ServerResponse) =>
					sendJSON(res, { status: "ok" })
			},
			{
				method: "GET",
				path: /^\/api\/ics\/(?<calendarName>[^/]+)\.ics$/,
				handler: this.getICS.bind(this)
			}
		];
	}

	async getICS(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const { calendarName = "" } = ctx.params as CalendarRouteParams;
		try {
			const ics = await this.generateICal(calendarName);
			sendICS(res, ics);
		} catch (error) {
			sendJSON(res, { error: (error as Error).message }, 500);
		}
	}

	private async generateICal(name: string): Promise<string> {
		const { content } = await github.getFile(`calendar/${name}.json`);
		const events = JSON.parse(content) as CalendarEvent[];

		const cal = createCalendar({ name });
		for (const ev of events) {
			cal.createEvent({
				summary: ev.title,
				start: new Date(ev.start),
				end: new Date(ev.end),
				description: ev.description,
				location: ev.location
			});
		}
		return cal.toString();
	}
}
