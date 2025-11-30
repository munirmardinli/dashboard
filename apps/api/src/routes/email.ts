import { sendJSON, sendError } from "../utils/http.js";
import { sendTemplate } from "../services/email/emailService.js";

export const emailRoutes: Route[] = [
	{
		method: "POST",
		path: /^\/api\/email\/send$/,
		handler: async (_req, res, ctx) => {
			try {
				const body = ctx.body as {
					to: string;
					subject: string;
					content: string;
					options?: EmailTemplateOptions;
				};

				if (!body.to || !body.subject || !body.content) {
					sendError(res, 400, "Missing required fields: to, subject, content");
					return;
				}

				const result = await sendTemplate(body.to, body.subject, body.content, body.options);
				sendJSON(res, result);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to send email");
			}
		},
	},
];
