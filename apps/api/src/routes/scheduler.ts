
import { sendJSON } from "../utils/http.js";

export const schedulerRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/scheduler$/,
		handler: async (_req, res) => {
			sendJSON(res, { message: "Scheduler routes - coming soon" });
		},
	},
];
