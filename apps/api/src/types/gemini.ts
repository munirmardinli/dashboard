declare global {
	interface GeminiRequestOptions {
		temperature?: number;
		maxTokens?: number;
		topP?: number;
		topK?: number;
	}

	interface GeminiResponse {
		success: boolean;
		text?: string;
		error?: string;
		usage?: {
			promptTokens?: number;
			candidatesTokens?: number;
			totalTokens?: number;
		};
	}

	interface GeminiBaseOptions {
		language?: string;
		tone?: "formal" | "casual" | "friendly";
	}

	interface GeminiReminderOptions extends GeminiBaseOptions {
		title: string;
		description?: string;
		date?: string;
		time?: string;
		startDate?: string;
		startTime?: string;
		endDate?: string;
		endTime?: string;
		location?: string;
		reminderType: string;
		category: string;
	}

	interface GeminiJournalReminderOptions extends GeminiBaseOptions {
		journalType: string;
	}

	/**
		* Gemini REST API Request Interface
		* Interne Struktur für HTTP-Requests an die Gemini API
		*/
	interface GeminiAPIRequest {
		contents: Array<{
			parts: Array<{
				text: string;
			}>;
		}>;
		generationConfig?: {
			temperature?: number;
			maxOutputTokens?: number;
			topP?: number;
			topK?: number;
		};
	}

	/**
		* Gemini REST API Response Interface
		* Interne Struktur für HTTP-Responses von der Gemini API
		*/
	interface GeminiAPIResponse {
		candidates?: Array<{
			content?: {
				parts?: Array<{
					text?: string;
				}>;
				role?: string;
			};
			finishReason?: string;
			index?: number;
		}>;
		usageMetadata?: {
			promptTokenCount?: number;
			candidatesTokenCount?: number;
			totalTokenCount?: number;
		};
		error?: {
			code?: number;
			message?: string;
			status?: string;
		};
		modelVersion?: string;
		responseId?: string;
	}
}

export { };
