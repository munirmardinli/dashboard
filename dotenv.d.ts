declare namespace NodeJS {
	interface ProcessEnv {
		/**
			* The base URL of the API server (public, accessible in client components)
			* @default http://localhost:4012
			*/
		NEXT_PUBLIC_API_URL: string;
		/**
			* The port where the API server runs
			* @example 4012
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
			* Enable bundle analyzer
			* @default false
			*/
		ANALYZE: string;
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
			* Google Gemini API Key für KI-Textgenerierung
			* @example AIzaSy...
			*/
		GEMINI_API_KEY: string;
		/**
			* Google Gemini API Model
			* @default gemini-2.5-flash
			*/
		GEMINI_MODEL: string;
		/**
		* Pushover application API token.
		* @format [a-zA-Z0-9]{30} (30 alphanumeric characters)
		* @see {@link https://pushover.net/api#registration | Pushover App Registration}
		*/
		PUSHOVER_API_TOKEN: string;
		/**
		* Pushover application user key.
		* @format [a-zA-Z0-9]{30} (30 alphanumeric characters)
		* @see {@link https://pushover.net/api#registration | Pushover App Registration}
		*/
		PUSHOVER_USER_KEY: string;
		/**
		* Path to the assets directory.
		* @default "assets"
		*/
		ASSETS_DIR: string;
		/**
		* The GitHub token
		* @example 1234567890
		*/
		GITHUB_TOKEN: string;
		/**
		* The GitHub owner
		* @example 1234567890
		*/
		GITHUB_OWNER: string;
		/**
		* The GitHub repository
		* @example 1234567890
		*/
		GITHUB_REPO: string;
		/**
		* The GitHub branch
		* @example 1234567890
		*/
		GITHUB_BRANCH: string;
		/**
		* The Twilio account SID
		* @example xxx
		*/
		TWILIO_ACCOUNT_SID: string;
		/**
		* The Twilio auth token
		* @example xxx
		*/
		TWILIO_AUTH_TOKEN: string;
		/**
		* The Twilio WhatsApp from
		* @example xxx
		*/
		TWILIO_WHATSAPP_FROM: string;
		/**
		* The Twilio WhatsApp to
		* @example xxx
		*/
		TWILIO_WHATSAPP_TO: string;
		/**
		* The cron expression for the reminder checker
		* @example "*\/60 * * * * *"
		*/
		REMINDER_CRON: string;
		/**
		* Whether to send a test WhatsApp message on startup
		* @example 1
		*/
		WHATSAPP_SEND_TEST_ON_START: string;
	}
}
