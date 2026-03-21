export class GeminiClient {
	private readonly apiKey: string;
	private readonly model: string;

	constructor() {
		this.apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
		this.model = process.env.GEMINI_MODEL?.trim() ?? "gemini-2.0-flash";
	}

	async generateFromImage(prompt: string, image: string): Promise<string> {
		if (!this.apiKey) {
			throw new Error("GEMINI_API_KEY fehlt in .env — Beleg-Analyse ist nicht konfiguriert.");
		}
		const mimeMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
		const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
		const base64Data = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

		const res = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{ text: prompt },
								{ inline_data: { mime_type: mimeType, data: base64Data } }
							]
						}
					]
				})
			}
		);

		if (!res.ok) {
			const errText = await res.text();
			throw new Error(`Gemini API Fehler (${res.status}): ${errText}`);
		}

		const data = await res.json() as {
			candidates?: { content?: { parts?: { text?: string }[] } }[];
		};

		const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!text) {
			throw new Error("Keine Antwort von Gemini erhalten");
		}

		return text;
	}
	
	extractJSON(text: string): unknown {
		const cleaned = text.replace(/```json|```/g, "");
		const match = cleaned.match(/\{[\s\S]*\}/);

		if (!match) {
			throw new Error("Kein JSON gefunden");
		}

		return JSON.parse(match[0]);
	}
}
