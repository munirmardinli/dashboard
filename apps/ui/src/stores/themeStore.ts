import { create } from "zustand";
import { applyTheme } from "@/utils/theme";
import { globalVars } from "@/utils/globalyVar";

const DEFAULT_THEME: ThemeMode = (process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE as ThemeMode) || 'light';

async function saveToCookieJson(data: Record<string, unknown>) {
	try {
		await fetch(`${globalVars.API_URL}/api/cookie`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
	} catch (e) {
		console.error("Failed to save to cookie.json", e);
	}
}

async function getFromCookieJson() {
	try {
		const res = await fetch(`${globalVars.API_URL}/api/cookie`);
		if (!res.ok) return {};
		return await res.json();
	} catch (e) {
		console.error("Failed to fetch cookie.json", e);
		return {};
	}
}

export const useThemeStore = create<ThemeState>((set) => ({
	mode: DEFAULT_THEME,
	isRTL: false,
	direction: "ltr",
	setMode: (mode: ThemeMode) => {
		saveToCookieJson({ [globalVars.COOKIE_NAME]: mode });
		applyTheme(mode);
		set({ mode });
	},
	setIsRTL: (isRTL: boolean) => {
		const direction: Direction = isRTL ? "rtl" : "ltr";
		saveToCookieJson({ [globalVars.RTL_COOKIE_NAME]: isRTL });
		set({ isRTL, direction });
	},
}));

export async function initializeThemeFromJson(): Promise<void> {
	if (typeof window === "undefined") return;
	
	const data = await getFromCookieJson();
	const storedTheme = (data[globalVars.COOKIE_NAME] as ThemeMode) || DEFAULT_THEME;
	const storedIsRTL = data[globalVars.RTL_COOKIE_NAME] === true || data.languageSelected === "ar";
	
	const currentState = useThemeStore.getState();

	if (storedTheme !== currentState.mode || storedIsRTL !== currentState.isRTL) {
		applyTheme(storedTheme);
		useThemeStore.setState({
			mode: storedTheme,
			isRTL: storedIsRTL,
			direction: storedIsRTL ? "rtl" : "ltr",
		});
	}
}
