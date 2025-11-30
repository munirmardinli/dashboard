import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

import { routes } from "./routes/index.js";
import { handleCORS, parseBody, sendError } from "./utils/http.js";
import { CalendarService } from "./services/calendar/calendarService.js";
import { Scheduler } from "./services/calendar/scheduler.js";
import { ReminderScheduler } from "./services/reminders/reminderScheduler.js";
import { TodoReminderScheduler } from "./services/reminders/todoReminderScheduler.js";

if (process.env.NODE_ENV !== "production") {
	const envPath = join(cwd(), ".env");
	if (existsSync(envPath)) {
		for (const line of readFileSync(envPath, "utf-8").split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const [key, ...valueParts] = trimmed.split("=");
			if (!key) continue;
			let value = valueParts.join("=").trim();
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
				value = value.slice(1, -1);
			}
			if (!process.env[key.trim()]) {
				process.env[key.trim()] = value;
			}
		}
	}
}

const PORT = process.env.PORT || "4011";

let calendarScheduler: Scheduler;
let reminderScheduler: ReminderScheduler;
let todoReminderScheduler: TodoReminderScheduler;

try {
	const calendarService = CalendarService.getInstance();
	calendarScheduler = new Scheduler(calendarService);
	reminderScheduler = new ReminderScheduler(calendarService);
	todoReminderScheduler = new TodoReminderScheduler();

	calendarScheduler.start();
	reminderScheduler.start();
	todoReminderScheduler.start();
} catch (error) {
	console.error("❌ Fehler beim Initialisieren der Services:", error);
	if (error instanceof Error) {
		console.error("Fehlermeldung:", error.message);
		console.error("Stack:", error.stack);
	}
	process.exit(1);
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
	try {
		handleCORS(req, res);

		
		if (req.method === "OPTIONS") {
			res.writeHead(200, {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
				"Access-Control-Max-Age": "86400",
			});
			res.end();
			return;
		}

		const url = new URL(req.url || "/", `http://${req.headers.host}`);
		const pathname = url.pathname;
		const method = req.method || "GET";

		let body: unknown = null;
		if (["POST", "PUT", "PATCH"].includes(method)) {
			body = await parseBody(req);
		}

		const route = routes.find(
			(r) => r.method === method && r.path.test(pathname)
		);

		if (route) {
			const match = pathname.match(route.path);
			await route.handler(req, res, { params: match?.groups || {}, body, query: Object.fromEntries(url.searchParams) });
		} else {
			sendError(res, 404, "Route not found");
		}
	} catch (error) {
		console.error("Server error:", error);
		sendError(res, 500, error instanceof Error ? error.message : "Internal server error");
	}
});

server.listen(Number(PORT), () => {
	console.log("📅 Calendar Scheduler gestartet");
	console.log("🔔 Reminder Scheduler gestartet");
	console.log("📋 Todo Reminder Scheduler gestartet");
	console.log(`🚀 API Server läuft auf Port ${PORT}`);
});

process.on("SIGTERM", () => {
	console.log("SIGTERM received, shutting down gracefully...");
	if (calendarScheduler) calendarScheduler.stop();
	if (reminderScheduler) reminderScheduler.stop();
	if (todoReminderScheduler) todoReminderScheduler.stop();
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
});

process.on("SIGINT", () => {
	console.log("SIGINT received, shutting down gracefully...");
	if (calendarScheduler) calendarScheduler.stop();
	if (reminderScheduler) reminderScheduler.stop();
	if (todoReminderScheduler) todoReminderScheduler.stop();
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
});
