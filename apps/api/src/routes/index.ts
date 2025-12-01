import { dataRoutes } from "./data.js";
import { calendarRoutes } from "./calendar.js";
import { configRoutes } from "./config.js";
import { geminiRoutes } from "./gemini.js";
import { schedulerRoutes } from "./scheduler.js";

export const routes: Route[] = [
	...dataRoutes,
	...calendarRoutes,
	...configRoutes,
	...geminiRoutes,
	...schedulerRoutes,
	{
		method: "GET",
		path: /^\/api\/health$/,
		handler: async (_req, res) => {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
		},
	},
	{
		method: "GET",
		path: /^\/api$/,
		handler: async (_req, res) => {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ message: "Dashboard API Server", version: "0.1.0" }));
		},
	},
];
