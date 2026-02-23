export class GeminiService {
	async call(prompt: string, options: Record<string, unknown> = {}): Promise<{ success: boolean; text?: string }> {
		const apiKey = process.env.GEMINI_API_KEY;
		const model = process.env.GEMINI_MODEL;
		if (!apiKey || !model) throw new Error("Missing Gemini config");

		const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
			method: "POST",
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: { ...options }
			})
		});

		const data = await res.json();
		return { success: true, text: data.candidates?.[0]?.content?.parts?.[0]?.text };
	}
}
