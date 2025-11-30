import type { IncomingMessage, ServerResponse } from "node:http";

export function handleCORS(req: IncomingMessage, res: ServerResponse): void {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	res.setHeader("Access-Control-Max-Age", "86400");
}

export function sendJSON(res: ServerResponse, data: unknown, statusCode = 200): void {
	res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(data));
}

export function sendError(res: ServerResponse, statusCode: number, message: string): void {
	sendJSON(res, { error: message, statusCode }, statusCode);
}

export function sendICS(res: ServerResponse, icsContent: string, statusCode = 200): void {
	res.writeHead(statusCode, {
		"Content-Type": "text/calendar; charset=utf-8",
		"Content-Disposition": "attachment; filename=calendar.ics",
	});
	res.end(icsContent);
}

export async function parseBody(req: IncomingMessage): Promise<unknown> {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => {
			try {
				if (!body) {
					resolve(null);
					return;
				}
				resolve(JSON.parse(body));
			} catch (error) {
				reject(new Error("Invalid JSON"));
			}
		});
		req.on("error", reject);
	});
}
