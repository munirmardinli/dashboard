declare global {
	// Basic & Data
	interface DataTypeConfig {
		filePath: string;
		title?: string;
	}

	interface DashboardConfig {
		dataTypes: Record<string, DataTypeConfig>;
		navigation?: Record<string, unknown>;
		onboarding?: unknown[];
		translations?: Record<string, string>;
	}

	type GenericItem = {
		id: string;
		createdAt?: string;
		updatedAt?: string;
		isArchive?: boolean;
	};
	type TodoItem = GenericItem & {
		title?: string;
		start?: string;
		end?: string;
		reminder?: string;
		description?: string;
	};

	// Params
	interface DataParams {
		dataType?: string;
		id?: string;
	}

	interface LanguageParams {
		language: string;
	}

	interface FilenameParams {
		filename?: string;
	}

	interface CalendarParams {
		calendarName?: string;
	}

	interface ImageParams {
		filepath?: string;
	}

	interface PosParams {
		0?: string;
	}

	interface DashyRouteParams { sectionId?: string; itemIndex?: string; }
	interface DataRouteParams { dataType?: string; id?: string; }
	interface LanguageRouteParams { language?: string; }
	interface DataTypeRouteParams { dataType?: string; }
	interface FilenameRouteParams { filename?: string; }
	interface CalendarRouteParams { calendarName?: string; }
	interface ImageRouteParams { filepath?: string; }
	interface DocsRouteParams { subPath?: string; }

	interface DocFolder {
		title: string;
		[key: string]: string | DocFolder;
	}

	type MetaData = Record<string, string | DocFolder>;

	// Calendar
	interface ICSAlarm {
		type: "audio" | "display" | "email";
		trigger: number;
		description?: string;
		attach?: string;
	}

	interface ICSEvent {
		summary: string;
		start: Date;
		end: Date;
		description?: string | null;
		location?: string | null;
		priority?: number | null;
		timezone: string;
		alarms?: ICSAlarm[];
	}

	interface ICSCalendar {
		name: string;
		description: string;
		timezone: string;
		events: ICSEvent[];
	}

	interface CalendarEvent {
		title: string;
		start: string;
		end: string;
		description?: string;
		location?: string;
		reminder?: string;
	}

	// Contact
	interface Contact extends GenericItem {
		name: string;
		phone: string;
		email?: string;
		address?: string;
		birthday?: string
	}

	// Dashy
	interface DashyItem {
		name: string;
		url: string;
		icon?: string;
		iconUrl?: string;
		isArchive?: boolean;
		updatedAt?: string;
	}

	interface DashySection {
		id: string;
		title: string;
		icon: string;
		items: DashyItem[];
	}

	interface DashyWidget {
		id: string;
		title: string;
		icon: string;
		type: string;
		gridColumns: number;
		data: Record<string, unknown>;
	}

	interface DashyData {
		title: string;
		user: {
			name: string;
			greeting: string;
		};
		header: {
			searchPlaceholder: string;
			design: {
				current: string;
				options: string[];
			};
			layout: string[];
			itemSize: string[];
		};
		footer: {
			text: string;
		};
		widgets: DashyWidget[];
		sections: DashySection[];
	}

	// Germini
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

	// Reminder Status
	interface ReminderStatus {
		itemId: string;
		category: string;
		sentAt: number;
		itemEnd: number;
	}

	// Scheduler
	interface ScheduledJob {
		cancel(): void;
	}

	// Receipt
	interface ReceiptAnalysisRequest {
		image: string;
	}

	interface ExpenseItem {
		key: string;
		value: number;
	}

	interface ExpenseData {
		id: string;
		date: string;
		store: string;
		items: ExpenseItem[];
		isArchive: boolean;
	}

	interface ReceiptAnalysisResponse {
		success: boolean;
		data?: Omit<ExpenseData, "id" | "isArchive">;
		error?: string;
	}
}

export { };
