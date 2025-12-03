const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export async function analyzeReceipt(base64Image: string): Promise<ReceiptAnalysisResponse> {
	const apiKey = process.env.GEMINI_API_KEY;
	const modelName = process.env.GEMINI_MODEL;

	if (!apiKey) {
		return {
			success: false,
			error: "GEMINI_API_KEY environment variable is not set",
		};
	}

	if (!modelName) {
		return {
			success: false,
			error: "GEMINI_MODEL environment variable is not set",
		};
	}

	try {
		// Remove data:image prefix if present
		const imageData = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");

		const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent`;

		const prompt = `Analysiere dieses Kassenbonbild und extrahiere die folgenden Informationen:

1. Store/Geschäft Name (z.B. "REWE", "EDEKA", "Domino's")
2. Datum und Uhrzeit des Kaufs im ISO 8601 Format (z.B. "2025-11-15T12:27:03Z")
3. Liste aller Artikel mit Namen und Preis

Antworte NUR mit einem gültigen JSON-Objekt in diesem exakten Format:
{
  "store": "Geschäftsname",
  "date": "2025-11-15T12:27:03Z",
  "items": [
    {"key": "Artikelname", "value": 9.99},
    {"key": "Artikelname 2", "value": 3.50}
  ]
}

Wichtig:
- "value" muss eine Zahl sein (nicht String)
- "date" muss im ISO 8601 Format sein
- Ignoriere Pfandbeträge nicht, füge sie als separate Items hinzu
- Wenn das Datum nicht lesbar ist, verwende das aktuelle Datum
- Antworte NUR mit dem JSON-Objekt, ohne zusätzlichen Text`;

		const requestBody = {
			contents: [
				{
					parts: [
						{
							text: prompt,
						},
						{
							inline_data: {
								mime_type: "image/jpeg",
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
			const errorMessage = (errorData as any).error?.message || `HTTP ${response.status}: ${response.statusText}`;
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

		const candidates = data.candidates;
		if (candidates && candidates.length > 0) {
			const firstCandidate = candidates[0];
			const parts = firstCandidate.content?.parts;

			if (parts && parts.length > 0) {
				const firstPart = parts[0];
				if (!firstPart) {
					return {
						success: false,
						error: "Keine gültige Antwort von Gemini API erhalten",
					};
				}

				const text = firstPart.text;

				if (text && typeof text === "string" && text.trim().length > 0) {
					try {
						let jsonText = text.trim();
						const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
						if (jsonMatch) {
							jsonText = jsonMatch[1]?.trim() || "";
						}

						const parsedData = JSON.parse(jsonText) as {
							store: string;
							date: string;
							items: ExpenseItem[];
						};

						if (!parsedData.store || !parsedData.date || !Array.isArray(parsedData.items)) {
							return {
								success: false,
								error: "Ungültige Datenstruktur von Gemini API erhalten",
							};
						}

						return {
							success: true,
							data: {
								store: parsedData.store,
								date: parsedData.date,
								items: parsedData.items,
							},
						};
					} catch (parseError) {
						return {
							success: false,
							error: `Fehler beim Parsen der JSON-Antwort: ${parseError instanceof Error ? parseError.message : "Unbekannter Fehler"}`,
						};
					}
				}
			}
		}

		return {
			success: false,
			error: "Keine gültige Antwort von Gemini API erhalten",
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
		return {
			success: false,
			error: `Fehler bei der Quittungsanalyse: ${errorMessage}`,
		};
	}
}
