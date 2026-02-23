import "./utils/env.js";
import { createServer } from "node:http";
import { URL } from "node:url";
import { handleCORS, parseBody, sendError } from "./utils/http.js";
import routers from "./routers/index.js";

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
		const message = error instanceof Error ? error.message : String(error);
		sendError(res, 500, message);
	}
});

server.listen(Number(PORT), () => console.log(`🚀 Server on ${PORT}`));
