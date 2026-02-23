export class ReceiptService {
	async analyze(image: string): Promise<unknown> {
		const apiKey = process.env.GEMINI_API_KEY;
		const model = process.env.GEMINI_MODEL;
		if (!apiKey || !model) throw new Error("Missing Gemini config");

		const prompt = `Analysiere diesen Kassenbonbild und extrahiere Informationen als JSON: { "store": string, "date": "ISO8601", "items": [{ "key": string, "value": number }] }`;
		const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
			method: "POST",
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: image.replace(/^data:image\/[a-zA-Z]+;base64,/, "") } }] }]
			})
		});

		const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) return null;

		const jsonMatch = text.match(/\{[\s\S]*\}/);
		return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
	}
}
