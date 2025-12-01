declare namespace NodeJS {
	interface ProcessEnv {
		/**
			* The base URL of the API server (public, accessible in client components)
			* @default http://localhost:4011
			*/
		NEXT_PUBLIC_API_URL: string;
		/**
			* The TinyMCE API key
			* @example 1234567890
			*/
		NEXT_PUBLIC_TINY_MCE_API_KEY: string;
		/**
			* The port where the API server runs
			* @example 4011
			*/
		PORT: string;
		/**
			* Telegram Bot Token
			* @example 1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ
			*/
		TELEGRAM_BOT_TOKEN: string;
		/**
			* Telegram Chat ID
			* @example 123456789
			*/
		TELEGRAM_CHAT_ID: string;
		/**
			* Telegram Bot Token
			* @example 1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ
			*/
		TELEGRAM_BOT_TOKEN: string;
		/**
			* Enable bundle analyzer
			* @default false
			*/
		ANALYZE: string;
		/**
			* The directory where the assets are stored
			* @example apps/api/public
			*/
		NEXT_PUBLIC_ASSETS_DIR: string;
		/**
			* The directory where the calendar data is stored
			* @example apps/api/public/calendar
			*/
		NEXT_PUBLIC_CALENDAR_DATA_DIR: string;
		/**
			* The directory where the calendar ICS files are stored
			* @example apps/api/public/ics
			*/
		NEXT_PUBLIC_CALENDAR_ICS_DIR: string;
		/**
			* The environment mode
			* @example development
			*/
		NODE_ENV: string;
		/**
			* The time zone
			* @example Europe/Berlin
			*/
		TZ: string;
		/**
			* The default language
			* @example de
			*/
		NEXT_PUBLIC_DEFAULT_LANGUAGE: string;
		/**
			* The active sound flag
			* @default true
			*/
		NEXT_PUBLIC_ACTIVE_SOUND: string;
		/**
			* The default theme mode
			* @default dark
			*/
		NEXT_PUBLIC_DEFAULT_THEME_MODE: string;
		/**
			* iCloud Mail E-Mail-Adresse für SMTP-Versand
			* @example deine-email@icloud.com
			*/
		ICLOUD_EMAIL: string;
		/**
			* iCloud Mail app-spezifisches Passwort für SMTP-Versand
			* Wird erstellt unter https://appleid.apple.com/account/manage
			*/
		ICLOUD_PASSWORD: string;
		/**
			* iCloud Mail SMTP-Host
			* @default smtp.mail.me.com
			*/
		ICLOUD_SMTP_HOST: string;
		/**
			* iCloud Mail SMTP-Port
			* @default 587
			*/
		ICLOUD_SMTP_PORT: string;
		/**
			* iCloud Mail SMTP-Secure
			* @default false
			*/
		ICLOUD_SMTP_SECURE: string;
		/**
			* Google Gemini API Key für KI-Textgenerierung
			* @example AIzaSy...
			*/
		GEMINI_API_KEY: string;
		/**
			* Google Gemini API Model
			* @default gemini-2.5-flash
			*/
		GEMINI_MODEL: string;
	}
}
