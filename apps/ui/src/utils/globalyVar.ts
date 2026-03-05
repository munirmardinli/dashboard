export const globalVars = {
	DEFAULT_VIEW: "/?q=dashy",
	API_URL: process.env.NEXT_PUBLIC_API_URL ??
		(process.env.NODE_ENV === "production"
			? ""
			: "http://localhost:4012"),
	PATHS: {
		home: "/",
	},
	DOCS_PATH: "/?q=docs&p=",
	COOKIE_NAME: "themeMode",
	RTL_COOKIE_NAME: "isRTL",
	DIGIT_MAP: {
		ar: {
			"0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
			"5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩",
		},
		default: {
			"0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
			"5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
		},
	} as Record<string, Record<string, string>>,
};

if (typeof globalThis !== 'undefined') {
	(globalThis).globalVars = globalVars;
}

export function initGlobalVars() {
	// No longer strictly needed but kept for compatibility

}
