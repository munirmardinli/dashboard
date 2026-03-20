import { Router, type Request, type Response } from "express";
import { GeminiClient } from "../utils/gemini.js";

const gemini = new GeminiClient();

class ReceiptRouter {
	getRouter(): Router {
		const router = Router();

		router.post("/api/receipt/analyze", this.post.bind(this));

		return router;
	}

	async post(req: Request, res: Response): Promise<void> {
		const { image = "" } = req.body as { image: string };

		try {
			const result = await this.analyze(image);
			res.json(result);
		} catch (error) {
			res.status(500).json({ success: false, error: (error as Error).message });
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

export { ReceiptRouter }
