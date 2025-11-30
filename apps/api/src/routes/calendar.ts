import { sendJSON, sendError, sendICS } from "../utils/http.js";
import { CalendarService } from "../services/calendar/calendarService.js";

export const calendarRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/calendar$/,
		handler: async (_req, res) => {
			sendJSON(res, { message: "Calendar routes - coming soon" });
		},
	},
	{
		method: "GET",
		path: /^\/api\/ics\/(?<calendarName>[^/]+)\.ics$/,
		handler: async (_req, res, ctx) => {
			try {
				const { calendarName } = ctx.params;
				if (!calendarName) {
					sendError(res, 400, "Calendar name is required");
					return;
				}

				const calendarService = CalendarService.getInstance();
				const icsContent = calendarService.generateICS(calendarName);
				sendICS(res, icsContent);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to generate ICS");
			}
		},
	},
];
