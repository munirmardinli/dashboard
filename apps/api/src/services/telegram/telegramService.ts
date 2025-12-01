import https from "node:https";

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
		let formattedContent = content
			.replace(/<br\s*\/?>/gi, "\n")
			.replace(/<\/p>/gi, "\n\n")
			.replace(/<p[^>]*>/gi, "")
			.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "<b>$1</b>")
			.replace(/<em[^>]*>(.*?)<\/em>/gi, "<i>$1</i>")
			.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "<b>$1</b>\n")
			.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '<a href="$1">$2</a>')
			.replace(/<[^>]+>/g, "")
			.replace(/\n{3,}/g, "\n\n")
			.trim();

		const message = `<b>${title}</b>\n\n${formattedContent}`;

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
