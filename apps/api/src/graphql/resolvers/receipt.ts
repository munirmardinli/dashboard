import { GeminiClient } from "../../utils/gemini.js";
import { assertJsonValue } from "../scalars/jsonScalar.js";
import type { Resolvers } from "../types/types.js";

class ReceiptGraphQL {
	private readonly gemini = new GeminiClient();

	getResolvers(): Partial<Resolvers> {
		return {
			Mutation: {
				analyzeReceipt: async (_p, args) => this.analyze(args.imageBase64),
			},
		} satisfies Partial<Resolvers>;
	}

	private async analyze(imageBase64: string) {
		try {
			const prompt = `Analysiere diesen Kassenbonbild und extrahiere Informationen als JSON: { "store": string, "date": "ISO8601", "items": [{ "key": string, "value": number }] }`;
			const text = await this.gemini.generateFromImage(prompt, imageBase64);
			const parsed = this.gemini.extractJSON(text);
			return { success: true, data: assertJsonValue(parsed), error: null as string | null };
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			return { success: false, data: null, error: msg };
		}
	}
}

export { ReceiptGraphQL }
