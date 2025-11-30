"use client";
import { create } from "zustand";
import { applyTheme } from "@/utils/theme";

const COOKIE_NAME = "themeMode";
const RTL_COOKIE_NAME = "isRTL";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const DEFAULT_THEME: ThemeMode = (process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE as ThemeMode) || 'light';

function getStoredTheme(): ThemeMode {
	if (typeof window === "undefined") return DEFAULT_THEME;
	const cookies = document.cookie.split(";");
	const themeCookie = cookies.find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
	if (themeCookie) {
		const theme = themeCookie.split("=")[1]?.trim();
		if (theme === "light" || theme === "dark" || theme === "contrast") return theme as ThemeMode;
	}
	return DEFAULT_THEME;
}

function saveThemeToCookie(mode: ThemeMode): void {
	if (typeof window === "undefined") return;
	document.cookie = `${COOKIE_NAME}=${mode}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

function getStoredIsRTL(): boolean {
	if (typeof window === "undefined") return false;
	const cookies = document.cookie.split(";");
	const rtlCookie = cookies.find((c) => c.trim().startsWith(`${RTL_COOKIE_NAME}=`));
	if (rtlCookie) return rtlCookie.split("=")[1]?.trim() === "true";
	const langCookie = cookies.find((c) => c.trim().startsWith("languageSelected="));
	if (langCookie) return langCookie.split("=")[1]?.trim() === "ar";
	return false;
}

function saveIsRTLToCookie(isRTL: boolean): void {
	if (typeof window === "undefined") return;
	document.cookie = `${RTL_COOKIE_NAME}=${isRTL}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export const useThemeStore = create<ThemeState>((set) => ({
	mode: DEFAULT_THEME,
	isRTL: typeof window !== "undefined" ? getStoredIsRTL() : false,
	direction: (typeof window !== "undefined" ? getStoredIsRTL() : false) ? "rtl" : "ltr",
	setMode: (mode: ThemeMode) => {
		saveThemeToCookie(mode);
		applyTheme(mode);
		set({ mode });
	},
	setIsRTL: (isRTL: boolean) => {
		const direction: Direction = isRTL ? "rtl" : "ltr";
		saveIsRTLToCookie(isRTL);
		set({ isRTL, direction });
	},
}));

export function initializeThemeFromCookie(): void {
	if (typeof window === "undefined") return;
	const storedTheme = getStoredTheme();
	const storedIsRTL = getStoredIsRTL();
	const currentState = useThemeStore.getState();

	if (!document.cookie.includes(`${COOKIE_NAME}=`)) saveThemeToCookie(storedTheme);
	if (!document.cookie.includes(`${RTL_COOKIE_NAME}=`)) saveIsRTLToCookie(storedIsRTL);

	if (storedTheme !== currentState.mode || storedIsRTL !== currentState.isRTL) {
		applyTheme(storedTheme);
		useThemeStore.setState({
			mode: storedTheme,
			isRTL: storedIsRTL,
			direction: storedIsRTL ? "rtl" : "ltr",
		});
	}
}
