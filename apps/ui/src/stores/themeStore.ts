import { create } from "zustand";
import { applyTheme } from "@/utils/theme";
import { globalVars } from "@/utils/globalyVar";

import { cookieService } from "@/utils/cookieService";

const DEFAULT_THEME: ThemeMode = (process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE as ThemeMode) || 'light';

export const useThemeStore = create<ThemeState>((set) => ({
	mode: DEFAULT_THEME,
	isRTL: false,
	direction: "ltr",
	setMode: (mode: ThemeMode) => {
		cookieService.set({ [globalVars.COOKIE_NAME]: mode });
		applyTheme(mode);
		set({ mode });
	},
	setIsRTL: (isRTL: boolean) => {
		const direction: Direction = isRTL ? "rtl" : "ltr";
		cookieService.set({ [globalVars.RTL_COOKIE_NAME]: isRTL });
		set({ isRTL, direction });
	},
}));

export async function initializeThemeFromJson(): Promise<void> {
	if (typeof window === "undefined") return;
	
	const data = await cookieService.get();
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
