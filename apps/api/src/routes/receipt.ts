import { sendJSON, sendError } from "../utils/http.js";
import { analyzeReceipt } from "../services/receipt/receiptService.js";

export const receiptRoutes: Route[] = [
	{
		method: "POST",
		path: /^\/api\/receipt\/analyze$/,
		handler: async (_req, res, ctx) => {
			try {
				const body = ctx.body as ReceiptAnalysisRequest;

				if (!body.image || typeof body.image !== "string") {
					sendError(res, 400, "Missing or invalid 'image' field (expected base64 string)");
					return;
				}

				const result = await analyzeReceipt(body.image);

				if (result.success && result.data) {
					sendJSON(res, result, 200);
				} else {
					sendError(res, 500, result.error || "Failed to analyze receipt");
				}
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to analyze receipt");
			}
		},
	},
];
