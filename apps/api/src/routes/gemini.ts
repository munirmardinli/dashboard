import { sendJSON, sendError } from "../utils/http.js";
import { callGeminiAPI } from "../services/gemini/geminiService.js";

export const geminiRoutes: Route[] = [
	{
		method: "POST",
		path: /^\/api\/gemini$/,
		handler: async (_req, res, ctx) => {
			try {
				const body = ctx.body as {
					prompt: string;
					options?: Partial<GeminiRequestOptions>;
				};

				if (!body.prompt || typeof body.prompt !== "string") {
					sendError(res, 400, "Missing or invalid 'prompt' field");
					return;
				}

				const result = await callGeminiAPI(body.prompt, body.options);
				sendJSON(res, result, result.success ? 200 : 500);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to call Gemini API");
			}
		},
	},
];
