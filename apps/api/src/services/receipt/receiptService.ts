const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export async function analyzeReceipt(base64Image: string): Promise<ReceiptAnalysisResponse> {
	const apiKey = process.env.GEMINI_API_KEY;
	const modelName = process.env.GEMINI_MODEL;

	if (!apiKey) {
		return { success: false, error: "GEMINI_API_KEY environment variable is not set" };
	}

	if (!modelName) {
		return { success: false, error: "GEMINI_MODEL environment variable is not set" };
	}

	try {
		const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
		const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

		const imageData = base64Image.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");

		const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent`;

		const prompt = `
Analysiere dieses Kassenbonbild und extrahiere die folgenden Informationen:

1. Store/Geschäft Name
2. Datum und Uhrzeit im ISO 8601 Format
3. Liste aller Artikel (Name + Preis)

Antwortformat:
{
  "store": "Geschäft",
  "date": "2025-11-15T12:27:03Z",
  "items": [
    {"key": "Artikelname", "value": 9.99}
  ]
}

Wichtig:
- value = Zahl (kein String)
- date = ISO 8601
- Pfand als separaten Posten aufführen
- Wenn Datum unlesbar → aktuelles Datum
- Antworte NUR mit dem JSON!
        `.trim();

		const requestBody = {
			contents: [
				{
					parts: [
						{ text: prompt },
						{
							inline_data: {
								mime_type: mimeType,
								data: imageData,
							},
						},
					],
				},
			],
			generationConfig: {
				temperature: 0.2,
				maxOutputTokens: 2048,
			},
		};

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-goog-api-key": apiKey,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			const errorMessage =
				(errorData as any).error?.message ||
				`HTTP ${response.status}: ${response.statusText}`;

			return {
				success: false,
				error: `Fehler beim Aufruf der Gemini API: ${errorMessage}`,
			};
		}

		const data = await response.json();

		if (data.error) {
			return {
				success: false,
				error: `Gemini API Fehler: ${data.error.message || "Unbekannter Fehler"}`,
			};
		}

		const candidate = data.candidates?.[0];
		const text = candidate?.content?.parts?.[0]?.text;

		if (!text || typeof text !== "string") {
			return { success: false, error: "Ungültige Antwort von Gemini API" };
		}

		let jsonText = text.trim();
		const match =
			jsonText.match(/```json\s*([\s\S]*?)```/) ??
			jsonText.match(/```\s*([\s\S]*?)```/);

		if (match?.[1]) {
			jsonText = match[1].trim();
		}


		let parsed;
		try {
			parsed = JSON.parse(jsonText);
		} catch (err) {
			return {
				success: false,
				error: `JSON-Parsing-Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"
					}`,
			};
		}

		if (!parsed.store || !parsed.date || !Array.isArray(parsed.items)) {
			return {
				success: false,
				error: "Ungültige Datenstruktur von Gemini",
			};
		}

		return {
			success: true,
			data: {
				store: parsed.store,
				date: parsed.date,
				items: parsed.items,
			},
		};
	} catch (error) {
		return {
			success: false,
			error: `Fehler bei der Analyse: ${error instanceof Error ? error.message : "Unbekannter Fehler"
				}`,
		};
	}
}
