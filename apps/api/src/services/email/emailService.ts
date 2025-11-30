import { connect } from "node:net";
import { connect as tlsConnect } from "node:tls";
import { env } from "node:process";

import { EmailTemplateStyles } from "./emailTemplate.js";

class EmailService {
	private socket?: ReturnType<typeof connect>;
	private dataBuffer = "";
	private readonly config: SmtpConfig;
	private readonly auth: { user: string; pass: string };

	private static _icloudSmtp: SmtpConfig | null = null;

	private static getICloudSmtpConfig(): SmtpConfig {
		if (this._icloudSmtp) {
			return this._icloudSmtp;
		}

		const host = env.ICLOUD_SMTP_HOST;
		if (!host) {
			throw new Error("ICLOUD_SMTP_HOST environment variable is not set");
		}

		const portStr = env.ICLOUD_SMTP_PORT;
		if (!portStr) {
			throw new Error("ICLOUD_SMTP_PORT environment variable is not set");
		}

		const port = parseInt(portStr, 10);
		if (isNaN(port) || port < 0 || port > 65535) {
			throw new Error(`Invalid SMTP port: ${portStr}. Must be a number between 0 and 65535.`);
		}

		const secure = env.ICLOUD_SMTP_SECURE === "true";

		this._icloudSmtp = {
			host,
			port,
			secure,
		};

		return this._icloudSmtp;
	}

	private static get ICLOUD_SMTP(): SmtpConfig {
		return this.getICloudSmtpConfig();
	}

	constructor(config: SmtpConfig, auth: { user: string; pass: string }) {
		this.config = config;
		this.auth = auth;
	}

	private write(command: string): void {
		if (!this.socket) throw new Error("Socket not connected");
		this.socket.write(command + "\r\n");
	}

	private readResponse(expectedCode: string): Promise<string> {
		return new Promise((res, rej) => {
			if (!this.socket) {
				rej(new Error("Socket not connected"));
				return;
			}

			let resolved = false;
			const cleanup = (): void => {
				if (this.socket) {
					this.socket.removeListener("data", onData);
				}
			};

			const timeout = setTimeout(() => {
				if (!resolved) {
					resolved = true;
					cleanup();
					rej(new Error(`SMTP Timeout: Keine Antwort auf ${expectedCode}`));
				}
			}, 30000);

			const onData = (chunk: Buffer): void => {
				if (resolved) return;

				this.dataBuffer += chunk.toString();
				const lines = this.dataBuffer.split("\r\n");

				if (lines.length > 0 && !this.dataBuffer.endsWith("\r\n")) {
					this.dataBuffer = lines.pop() || "";
				} else {
					this.dataBuffer = "";
				}

				for (const line of lines) {
					if (!line) continue;

					const statusMatch = line.match(/^(\d{3})([- ])(.*)$/);
					if (statusMatch) {
						const [, statusCode, continuation] = statusMatch;

						if (!statusCode || !continuation) {
							continue;
						}

						if (statusCode >= "400") {
							if (!resolved) {
								resolved = true;
								clearTimeout(timeout);
								cleanup();
								rej(new Error(`SMTP Error: ${line}`));
							}
							return;
						}

						if (statusCode === expectedCode && continuation === " ") {
							if (!resolved) {
								resolved = true;
								clearTimeout(timeout);
								cleanup();
								res(line);
							}
							return;
						}
					}
				}
			};

			this.socket.on("data", onData);
		});
	}

	private async connectTls(): Promise<void> {
		return new Promise((res, rej) => {
			if (!this.socket) {
				rej(new Error("Socket not connected"));
				return;
			}

			const tlsSocket = tlsConnect(
				{
					socket: this.socket,
					host: this.config.host,
					rejectUnauthorized: true,
				},
				() => {
					this.socket = tlsSocket as unknown as ReturnType<typeof connect>;
					res();
				}
			);

			tlsSocket.on("error", rej);
		});
	}

	private async handshake(): Promise<void> {
		if (!this.socket) throw new Error("Socket not connected");

		await this.readResponse("220");
		this.write(`EHLO ${this.config.host}`);
		await this.readResponse("250");

		if (!this.config.secure) {
			this.write("STARTTLS");
			await this.readResponse("220");
			await this.connectTls();
			this.write(`EHLO ${this.config.host}`);
			await this.readResponse("250");
		}
	}

	private async authenticate(): Promise<void> {
		this.write("AUTH LOGIN");
		await this.readResponse("334");
		this.write(Buffer.from(this.auth.user).toString("base64"));
		await this.readResponse("334");
		this.write(Buffer.from(this.auth.pass).toString("base64"));
		await this.readResponse("235");
	}

	private async sendEnvelope(from: string, to: string[]): Promise<void> {
		this.write(`MAIL FROM:<${from}>`);
		await this.readResponse("250");

		for (const recipient of to) {
			this.write(`RCPT TO:<${recipient}>`);
			await this.readResponse("250");
		}
	}

	private async sendData(body: string): Promise<void> {
		this.write("DATA");
		await this.readResponse("354");
		if (this.socket) {
			const bodyEndsWithCRLF = body.endsWith("\r\n");
			this.socket.write(body + (bodyEndsWithCRLF ? "" : "\r\n"));
		}
		this.write(".");
		await this.readResponse("250");
	}

	private async disconnect(): Promise<void> {
		this.write("QUIT");
		await this.readResponse("221");
		this.socket?.end();
	}

	private async sendSmtp(options: SmtpOptions & { body: string }): Promise<void> {
		return new Promise((resolve, reject) => {
			this.socket = connect(this.config.port, this.config.host);
			this.dataBuffer = "";

			this.socket.on("error", (error) => {
				this.socket?.end();
				reject(error);
			});

			this.socket.on("connect", async () => {
				try {
					await this.handshake();
					await this.authenticate();
					await this.sendEnvelope(options.from, options.to);
					await this.sendData(options.body);
					await this.disconnect();
					resolve();
				} catch (error) {
					this.socket?.end();
					this.socket?.destroy();
					reject(error);
				}
			});
		});
	}

	private static escapeHtml(text: string): string {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;",
		};
		return text.replace(/[&<>"']/g, (m) => map[m] || m);
	}

	private static createEmailTemplate(content: string, options?: EmailTemplateOptions): string {
		const { title, footer, showSentDate = true, darkMode = false } = options || {};

		const sentDate = showSentDate
			? new Date().toLocaleDateString("de-DE", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
			: null;

		const styles = EmailTemplateStyles.generateStyles(darkMode);

		return `
		<!DOCTYPE html>
		<html lang="de">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<style>
					${styles}
				</style>
			</head>
			<body>
				<div class="container">
					${title ? `<div class="header"><h1>${this.escapeHtml(title)}</h1></div>` : ""}
					<div class="content">
						${content || '<p style="color: inherit;">Kein Inhalt</p>'}
					</div>
					${(footer || sentDate) ? `
						<div class="footer">
							${footer ? `<p class="footer-text">${this.escapeHtml(footer)}</p>` : ""}
							${sentDate ? `<p class="footer-text">Gesendet am: ${this.escapeHtml(sentDate)}</p>` : ""}
						</div>
					` : ""}
				</div>
			</body>
		</html>
	`;
	}

	private static isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	private static encodeMimeHeader(text: string): string {
		return /^[\x00-\x7F]*$/.test(text)
			? text
			: `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`;
	}

	private static stripHtml(html: string): string {
		let prev;
		do {
			prev = html;
			html = html.replace(/<[^>]*>/g, "");
		} while (html !== prev);
		return html
			.replace(/&(nbsp|amp|lt|gt|quot|#039);/g, (_, m) =>
				m === "nbsp" ? " " : m === "amp" ? "&" : m === "lt" ? "<" : m === "gt" ? ">" : m === "quot" ? '"' : "'"
			)
			.trim();
	}

	private static escapeDataBody(body: string): string {
		return body.replace(/^\./gm, "..");
	}

	private static formatEmailAddress(email: string, name?: string): string {
		return name?.trim() ? `${this.encodeMimeHeader(name.trim())} <${email}>` : email;
	}

	private static extractEmail(emailOrNameEmail: string): string {
		return emailOrNameEmail.match(/<([^>]+)>/)?.[1] || emailOrNameEmail.trim();
	}

	private static createEmailBody(options: {
		from: string;
		fromName?: string;
		to: string[];
		toNames?: (string | undefined)[];
		subject: string;
		html?: string;
		text?: string;
		host: string;
	}): string {
		const messageId = `<${Date.now()}-${Math.random().toString(36)}@${options.host}>`;
		const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
		const fromDisplay = this.formatEmailAddress(options.from, options.fromName);
		const toDisplay = options.to
			.map((email, i) => this.formatEmailAddress(email, options.toNames?.[i]))
			.join(", ");

		const headers = [
			`From: ${fromDisplay}`,
			`To: ${toDisplay}`,
			`Subject: ${this.encodeMimeHeader(options.subject)}`,
			`Date: ${new Date().toUTCString()}`,
			`Message-ID: ${messageId}`,
			`MIME-Version: 1.0`,
		];

		if (options.html && options.text) {
			headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
			return [
				...headers,
				"",
				`--${boundary}`,
				"Content-Type: text/plain; charset=utf-8",
				"Content-Transfer-Encoding: 7bit",
				"",
				this.escapeDataBody(options.text),
				"",
				`--${boundary}`,
				"Content-Type: text/html; charset=utf-8",
				"Content-Transfer-Encoding: 7bit",
				"",
				this.escapeDataBody(options.html),
				"",
				`--${boundary}--`,
			].join("\r\n");
		}

		if (options.html) {
			headers.push("Content-Type: text/html; charset=utf-8", "Content-Transfer-Encoding: 7bit");
			return [...headers, "", this.escapeDataBody(options.html)].join("\r\n");
		}

		headers.push("Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 7bit");
		return [...headers, "", this.escapeDataBody(options.text || "")].join("\r\n");
	}

	private static getCredentials(): { email: string; password: string } | null {
		const email = env.ICLOUD_EMAIL!;
		const password = env.ICLOUD_PASSWORD!;

		if (!email || !password) {
			throw new Error("ICLOUD_EMAIL und ICLOUD_PASSWORD müssen konfiguriert sein.");
		}

		return { email, password };
	}

	static async send(options: EmailOptions): Promise<EmailResult> {
		const credentials = this.getCredentials();
		if (!credentials) {
			return {
				success: false,
				error: "ICLOUD_EMAIL und ICLOUD_PASSWORD müssen konfiguriert sein.",
			};
		}

		const recipients = Array.isArray(options.to) ? options.to : [options.to];
		const recipientEmails = recipients.map((r) => this.extractEmail(r));
		const invalidEmails = recipientEmails.filter((email) => !this.isValidEmail(email));

		if (invalidEmails.length > 0) {
			return {
				success: false,
				error: `Ungültige E-Mail-Adressen: ${invalidEmails.join(", ")}`,
			};
		}

		const fromEmail = options.from ? this.extractEmail(options.from) : credentials.email;
		const toNames = Array.isArray(options.toName)
			? options.toName
			: options.toName
				? [options.toName]
				: undefined;

		const content = options.html || (options.text ? `<p>${options.text}</p>` : "");
		const htmlContent = content.includes("<html") ? content : this.createEmailTemplate(content);
		const textContent = this.stripHtml(content);

		try {
			const emailBody = this.createEmailBody({
				from: fromEmail,
				fromName: "Munir Mardinli",
				to: recipientEmails,
				toNames,
				subject: options.subject,
				html: htmlContent,
				text: textContent,
				host: this.ICLOUD_SMTP.host,
			});

			const client = new EmailService(this.ICLOUD_SMTP, {
				user: credentials.email,
				pass: credentials.password,
			});

			await client.sendSmtp({
				host: this.ICLOUD_SMTP.host,
				port: this.ICLOUD_SMTP.port,
				secure: this.ICLOUD_SMTP.secure,
				auth: {
					user: credentials.email,
					pass: credentials.password,
				},
				from: fromEmail,
				to: recipientEmails,
				subject: options.subject,
				html: htmlContent,
				text: textContent,
				body: emailBody,
			});

			return {
				success: true,
				messageId: `smtp-${Date.now()}`,
			};
		} catch (error) {
			return {
				success: false,
				error: `E-Mail-Versand fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
			};
		}
	}

	static async sendTemplate(
		to: string,
		subject: string,
		content: string,
		options?: EmailTemplateOptions
	): Promise<EmailResult> {
		const html = this.createEmailTemplate(content, options);
		return this.send({
			to,
			subject,
			html,
		});
	}
}

export async function sendTemplate(
	to: string,
	subject: string,
	content: string,
	options?: EmailTemplateOptions
): Promise<EmailResult> {
	return EmailService.sendTemplate(to, subject, content, options);
}
