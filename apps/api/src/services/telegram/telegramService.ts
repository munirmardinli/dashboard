import https from "node:https";
import sanitizeHtml from "sanitize-html";

class TelegramService {
	private static async makeRequest(
		botToken: string,
		method: string,
		data: TelegramSendMessageOptions
	): Promise<TelegramResponse> {
		return new Promise((resolve, reject) => {
			const payload = JSON.stringify(data);
			const options = {
				hostname: "api.telegram.org",
				port: 443,
				path: `/bot${botToken}/${method}`,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(payload),
				},
			};

			const req = https.request(options, (res) => {
				let body = "";

				res.on("data", (chunk) => {
					body += chunk;
				});

				res.on("end", () => {
					try {
						const response = JSON.parse(body) as TelegramResponse;
						resolve(response);
					} catch (error) {
						reject(new Error(`Failed to parse Telegram response: ${body}`));
					}
				});
			});

			req.on("error", (error) => {
				reject(error);
			});

			req.write(payload);
			req.end();
		});
	}

	static async sendMessage(options: TelegramSendMessageOptions): Promise<TelegramResult> {
		const botToken = process.env.TELEGRAM_BOT_TOKEN;

		if (!botToken) {
			return {
				success: false,
				error: "TELEGRAM_BOT_TOKEN environment variable is not set",
			};
		}

		try {
			const response = await this.makeRequest(botToken, "sendMessage", options);

			if (response.ok) {
				return {
					success: true,
					messageId: response.result?.message_id,
				};
			}

			return {
				success: false,
				error: response.description || "Unknown error",
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}

	static async sendFormattedMessage(
		chatId: string | number,
		title: string,
		content: string
	): Promise<TelegramResult> {
		// Allow only Telegram-supported HTML tags
		let sanitizedContent = sanitizeHtml(content, {
			allowedTags: ["b", "i", "u", "a", "code", "pre", "br"],
			allowedAttributes: {
				a: ["href"],
			},
			allowedSchemes: ["http", "https"],
			// We want to keep line breaks for formatting
			allowedSchemesByTag: {},
		});
		// Replace <br> tags with actual line breaks, if desired
		let formattedContent = sanitizedContent
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/\n{3,}/g, "\n\n")
			.trim();

		const message = `<b>${sanitizeHtml(title, { allowedTags: ["b"] })}</b>\n\n${formattedContent}`;

		return this.sendMessage({
			chat_id: chatId,
			text: message,
			parse_mode: "HTML",
			disable_web_page_preview: true,
		});
	}
}

export async function sendTelegramMessage(
	title: string,
	content: string
): Promise<TelegramResult> {
	const chatId = process.env.TELEGRAM_CHAT_ID;

	if (!chatId) {
		return {
			success: false,
			error: "TELEGRAM_CHAT_ID environment variable is not set",
		};
	}

	return TelegramService.sendFormattedMessage(chatId, title, content);
}

export default TelegramService;
