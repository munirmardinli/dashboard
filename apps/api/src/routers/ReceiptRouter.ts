import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { GeminiClient } from "../utils/gemini.js";

const gemini = new GeminiClient();

export class ReceiptRouter {
	getRoutes(): Route[] {
		return [
			{ method: "POST", path: /^\/api\/receipt\/analyze$/, handler: this.post.bind(this) }
		];
	}
	async post(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const body = ctx.body as { image: string };

		try {
			const result = await this.analyze(body.image);
			sendJSON(res, result);
		} catch (error) {
			sendJSON(res, { success: false, error: (error as Error).message }, 500);
		}
	}
	private async analyze(image: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
		try {
			const prompt = `Analysiere diesen Kassenbonbild und extrahiere Informationen als JSON: { "store": string, "date": "ISO8601", "items": [{ "key": string, "value": number }] }`;
			const text = await gemini.generateFromImage(prompt, image);
			const parsed = gemini.extractJSON(text);
			return { success: true, data: parsed };
		} catch (error) {
			return { success: false, error: (error as Error).message };
		}
	}
}
