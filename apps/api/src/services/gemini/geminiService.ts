import { ReminderHelper } from "../../utils/reminder.js";
import "../../types/gemini.js";

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export async function callGeminiAPI(
	prompt: string,
	options?: Partial<GeminiRequestOptions>
): Promise<GeminiResponse> {
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
		const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent`;

		const requestBody: GeminiAPIRequest = {
			contents: [
				{
					parts: [
						{
							text: prompt,
						},
					],
				},
			],
			generationConfig: {
				temperature: options?.temperature ?? 0.7,
				maxOutputTokens: options?.maxTokens,
				topP: options?.topP,
				topK: options?.topK,
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
			const errorData = (await response.json().catch(() => ({}))) as GeminiAPIResponse;
			const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
			return {
				success: false,
				error: `Fehler beim Aufruf der Gemini API: ${errorMessage}`,
			};
		}

		const data = (await response.json()) as GeminiAPIResponse;

		
		if (data.error) {
			return {
				success: false,
				error: `Gemini API Fehler: ${data.error.message || "Unbekannter Fehler"}`,
			};
		}


		
		const candidates = data.candidates;

		if (candidates && candidates.length > 0) {
			const firstCandidate = candidates[0];
			if (!firstCandidate) {
				return { success: false, error: "No candidate found in response" };
			}

			
			const finishReason = (firstCandidate as { finishReason?: string })?.finishReason;
			const parts = firstCandidate.content?.parts;

			
			if (parts && parts.length > 0) {
				const firstPart = parts[0];
				if (firstPart) {
					const text = firstPart.text;

					if (text && typeof text === "string" && text.trim().length > 0) {
						
						if (finishReason === "MAX_TOKENS") {
							console.warn("⚠️  Warnung: Antwort wurde bei MAX_TOKENS abgeschnitten, aber Text wurde extrahiert.");
						}
						return {
							success: true,
							text: text.trim(),
							usage: data.usageMetadata
								? {
									promptTokens: data.usageMetadata.promptTokenCount || 0,
									candidatesTokens: data.usageMetadata.candidatesTokenCount || 0,
									totalTokens: data.usageMetadata.totalTokenCount || 0,
								}
								: undefined,
						};
					}
				}
			}

			
			if (finishReason === "MAX_TOKENS") {
				return {
					success: false,
					error: `Gemini Antwort wurde abgeschnitten bevor Text generiert wurde (MAX_TOKENS erreicht). Bitte erhöhe maxTokens deutlich (aktuell: ${options?.maxTokens || "nicht gesetzt"}).`,
				};
			}
			if (finishReason === "SAFETY") {
				return {
					success: false,
					error: `Gemini hat die Antwort aus Sicherheitsgründen blockiert (finishReason: SAFETY).`,
				};
			}
			if (finishReason && finishReason !== "STOP") {
				return {
					success: false,
					error: `Gemini Antwort wurde mit finishReason "${finishReason}" beendet.`,
				};
			}

			
			if (!parts || parts.length === 0) {
				return {
					success: false,
					error: `Keine Text-Teile in der Antwort gefunden. finishReason: ${finishReason || "unbekannt"}`,
				};
			}
		}

		
		const errorDetails = {
			hasCandidates: !!candidates,
			candidatesLength: candidates?.length || 0,
			firstCandidate: candidates?.[0] ? "exists" : "missing",
			hasContent: !!candidates?.[0]?.content,
			hasParts: !!candidates?.[0]?.content?.parts,
			partsLength: candidates?.[0]?.content?.parts?.length || 0,
			rawResponse: JSON.stringify(data).substring(0, 500),
		};

		return {
			success: false,
			error: `Ungültige Antwort von Gemini API - leerer Text oder falsche Struktur. Details: ${JSON.stringify(errorDetails)}`,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
		return {
			success: false,
			error: `Fehler beim Aufruf der Gemini API: ${errorMessage}`,
		};
	}
}

export async function generateReminderContent(options: GeminiReminderOptions): Promise<string> {
	const {
		title,
		description,
		date,
		time,
		location,
		reminderType,
		category,
		language = "de",
		tone = "friendly",
	} = options;

	const reminderLabel = ReminderHelper.getReminderLabel(reminderType);

	const toneInstructions: Record<string, string> = {
		formal: "Verwende eine formelle, professionelle Sprache.",
		casual: "Verwende eine lockere, umgangssprachliche Sprache.",
		friendly: "Verwende eine freundliche, persönliche und warmherzige Sprache.",
	};

	const prompt = `Erstelle eine E-Mail-Erinnerung für ein Kalender-Event auf ${language === "de" ? "Deutsch" : language === "en" ? "Englisch" : "Französisch"}.

${toneInstructions[tone]}

Wichtig: Schreibe in der "Ich"-Form, da der Inhaber die E-Mail an sich selbst erhält.

Event-Details:
- Titel: ${title}
- Datum: ${date}
- Zeit: ${time}
${location ? `- Ort: ${location}` : ""}
${description ? `- Beschreibung: ${description}` : ""}
- Erinnerung: ${reminderLabel} vorher

Erstelle eine E-Mail (max. 200 Wörter) mit:
1. Kurzer Einleitung in "Ich"-Form
2. Event-Titel prominent
3. Event-Details (Zeit, Ort) in flüssigen Sätzen
${description ? "4. Interessante Beschreibung umformuliert" : "4. Event-Informationen vereinfacht"}
5. Signatur: "Mein Automatismus aus Dashboard Projekt"

Wichtig: 
- Vollständige Sätze, keine Bullet Points
- Kategorie ${category} nur im Header, nicht im Content
- Signatur am Ende, keine Erinnerungs-Info

Format: HTML (<p>, <strong>, <br> Tags, kein <html>/<body>)
Stil: Modern, klar, mit Emojis (📅, 📍, 📝)
Antworte NUR mit dem HTML-Content.`;

	const result = await callGeminiAPI(prompt, {
		temperature: tone === "formal" ? 0.3 : tone === "casual" ? 0.9 : 0.7,
		maxTokens: 3000,
	});

	if (result.success && result.text) {
		const trimmedText = result.text.trim();
		if (trimmedText.length > 0) {
			return trimmedText;
		}
		throw new Error("Gemini lieferte leeren Text");
	} else {
		throw new Error(result.error || "Unbekannter Gemini API Fehler");
	}
}

export async function generateTodoReminderContent(options: GeminiReminderOptions): Promise<string> {
	const {
		title,
		description,
		startDate,
		startTime,
		endDate,
		endTime,
		reminderType,
		category,
		language = "de",
		tone = "friendly",
	} = options;

	if (!startDate || !startTime || !endDate || !endTime) {
		throw new Error("startDate, startTime, endDate und endTime sind erforderlich für Todo-Reminder");
	}

	const reminderLabel = ReminderHelper.getReminderLabel(reminderType);

	const toneInstructions: Record<string, string> = {
		formal: "Verwende eine formelle, professionelle Sprache.",
		casual: "Verwende eine lockere, umgangssprachliche Sprache.",
		friendly: "Verwende eine freundliche, persönliche und warmherzige Sprache.",
	};

	const isSameDay = startDate === endDate;
	const timeDisplay = isSameDay
		? `${startDate} um ${startTime} - ${endTime} Uhr`
		: `${startDate} um ${startTime} Uhr - ${endDate} um ${endTime} Uhr`;

	const prompt = `Erstelle eine KURZE E-Mail-Erinnerung für eine Todo-Aufgabe auf ${language === "de" ? "Deutsch" : language === "en" ? "Englisch" : "Französisch"}.

${toneInstructions[tone]}

Wichtig: Schreibe in der "Ich"-Form, da der Inhaber die E-Mail an sich selbst erhält.

Todo-Details:
- Titel: ${title}
- Zeitraum: ${timeDisplay}
${description ? `- Beschreibung: ${description}` : ""}
- Erinnerung: ${reminderLabel} vorher

Erstelle eine SEHR KURZE E-Mail (max. 100 Wörter) mit:
1. Kurzer Einleitung in "Ich"-Form
2. Todo-Titel prominent
3. Zeitinformationen kompakt
${description ? "4. Kurze Beschreibungs-Zusammenfassung" : ""}
5. Signatur: "Mein Automatismus aus Dashboard Projekt"

Wichtig: 
- Vollständige Sätze, keine Bullet Points
- Kategorie ${category} nur im Header, nicht im Content
- Signatur am Ende, keine Erinnerungs-Info

Format: HTML (<p>, <strong>, <br> Tags, kein <html>/<body>)
Stil: Modern, klar, mit Emojis (📋, ⏰)
Antworte NUR mit dem HTML-Content.`;

	const result = await callGeminiAPI(prompt, {
		temperature: tone === "formal" ? 0.3 : tone === "casual" ? 0.9 : 0.7,
		maxTokens: 3000,
	});

	if (result.success && result.text) {
		const trimmedText = result.text.trim();
		if (trimmedText.length > 0) {
			return trimmedText;
		}
		throw new Error("Gemini lieferte leeren Text");
	} else {
		throw new Error(result.error || "Unbekannter Gemini API Fehler");
	}
}
