declare global {
	interface TelegramSendMessageOptions {
		chat_id: string | number;
		text: string;
		parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
		disable_web_page_preview?: boolean;
		disable_notification?: boolean;
	}

	interface TelegramResponse {
		ok: boolean;
		result?: {
			message_id: number;
			date: number;
			chat: {
				id: number;
				type: string;
			};
			text?: string;
		};
		description?: string;
		error_code?: number;
	}

	interface TelegramResult {
		success: boolean;
		messageId?: number;
		error?: string;
	}
}

export { }
