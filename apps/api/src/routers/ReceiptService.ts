export class ReceiptService {
	async analyze(image: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
		const apiKey = process.env.GEMINI_API_KEY;
		const model = process.env.GEMINI_MODEL;
		if (!apiKey || !model) throw new Error("Missing Gemini config");

		const mimeMatch = image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
		const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
		const base64Data = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

		const prompt = `Analysiere diesen Kassenbonbild und extrahiere Informationen als JSON: { "store": string, "date": "ISO8601", "items": [{ "key": string, "value": number }] }`;
		const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }]
			})
		});

		if (!res.ok) {
			const errText = await res.text();
			return { success: false, error: `Gemini API Fehler (${res.status}): ${errText}` };
		}

		const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) return { success: false, error: "Keine Antwort von Gemini erhalten" };

		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) return { success: false, error: "Kein JSON in der Gemini-Antwort gefunden" };

		try {
			const parsed = JSON.parse(jsonMatch[0]);
			return { success: true, data: parsed };
		} catch {
			return { success: false, error: "JSON-Parsing fehlgeschlagen" };
		}
	}
}
