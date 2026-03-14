import "./utils/env.js";
import { createServer } from "node:http";
import { URL } from "node:url";
import { handleCORS, parseBody, sendError } from "./utils/http.js";
import routers from "./routers/index.js";
import { sendWhatsapp } from "./utils/whatsapp.js";
import { scheduleJob } from "./utils/scheduler.js";
import { checkAndSendReminders } from "./utils/reminderChecker.js";

const PORT = process.env.PORT || "4012";

const allRoutes = routers.flatMap(r => r.getRoutes());

const server = createServer(async (req, res) => {
	try {
		handleCORS(req, res);
		if (req.method === "OPTIONS") return res.end();

		const url = new URL(req.url || "/", `http://${req.headers.host}`);
		const pathname = url.pathname;
		const method = req.method || "GET";

		const body = ["POST", "PUT", "PATCH"].includes(method) ? await parseBody(req) : null;
		const route = allRoutes.find(r => r.method === method && r.path.test(pathname));

		if (route) {
			const match = pathname.match(route.path);
			await route.handler(req, res, { params: match?.groups || {}, body, query: Object.fromEntries(url.searchParams) });
		} else {
			sendError(res, 404, "Not found");
		}
	} catch (error) {
		// Log full error details on the server for debugging purposes
		console.error("Unhandled error while processing request:", error);

		// Send a generic error message to the client to avoid leaking internal details
		const message = "Internal server error";
		sendError(res, 500, message);
	}
});

server.listen(Number(PORT), () => {
	console.log(`🚀 Server on ${PORT}`);
	
	try {
		scheduleJob("*/60 * * * * *", () => {
			checkAndSendReminders();
		});
		console.log("✅ Reminder scheduler started (every 60s)");
	} catch (err) {
		console.error("❌ Failed to start reminder scheduler:", err);
	}
});
