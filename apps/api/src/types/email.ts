declare global {
	interface SmtpConfig {
		host: string;
		port: number;
		secure: boolean;
	}

	interface SmtpOptions {
		host: string;
		port: number;
		secure: boolean;
		auth: {
			user: string;
			pass: string;
		};
		from: string;
		to: string[];
		subject: string;
		html?: string;
		text?: string;
		body: string;
	}

	interface EmailOptions {
		to: string | string[];
		subject: string;
		html?: string;
		text?: string;
		from?: string;
		toName?: string | string[];
	}

	interface EmailResult {
		success: boolean;
		messageId?: string;
		error?: string;
	}

	interface EmailTemplateOptions {
		title?: string;
		footer?: string;
		showSentDate?: boolean;
		darkMode?: boolean;
	}
}

export { };
