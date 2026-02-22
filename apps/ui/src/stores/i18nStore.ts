"use client";

import { create } from "zustand";

import { useThemeStore } from "@/stores/themeStore";

const defaultLanguageEnv = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;
if (!defaultLanguageEnv) {
	throw new Error("NEXT_PUBLIC_DEFAULT_LANGUAGE environment variable is not set");
}
const defaultLanguage: Language = defaultLanguageEnv as Language;

const languageToLocale: Record<Language, string> = {
	de: "de-DE",
	en: "en-US",
	fr: "fr-FR",
	ar: "ar-SA",
};

function getTimezone(): string {
	if (typeof process !== "undefined" && process.env?.TZ) {
		return process.env.TZ;
	}
	if (typeof window !== "undefined" && Intl) {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		} catch {
			return "Europe/Berlin";
		}
	}
	return "Europe/Berlin";
}

function getStoredLanguage(): Language {
	if (typeof window === "undefined") return defaultLanguage;

	const cookies = document.cookie.split(";");
	const langCookie = cookies.find((c) => c.trim().startsWith("languageSelected="));
	if (langCookie) {
		const lang = langCookie.split("=")[1]?.trim();
		if (lang === "de" || lang === "en" || lang === "fr" || lang === "ar") {
			return lang as Language;
		}
	}

	return defaultLanguage;
}

function saveLanguageToCookie(lang: Language): void {
	if (typeof window === "undefined") return;
	document.cookie = `languageSelected=${lang}; max-age=${30 * 24 * 60 * 60}; path=/`;
}

async function loadTranslationFile(lang: Language): Promise<Translations> {
	try {
		const { ConfigAPI } = await import("@/utils/api");
		const translations = await ConfigAPI.getTranslations(lang);
		return (translations as Translations) || ({} as Translations);
	} catch (error) {
		console.error(`Error loading translation file for ${lang}:`, error);
		return {} as Translations;
	}
}

function getNestedValue(obj: TranslationValue, path: string): string {
	const keys = path.split(".");
	let current: unknown = obj;

	for (const key of keys) {
		if (current == null || typeof current !== "object") {
			return "";
		}
		const next = (current as Record<string, unknown>)[key];
		if (next === undefined) {
			return "";
		}
		current = next;
	}

	return typeof current === "string" ? current : "";
}

function getDigitMap(language: Language): Record<string, string> {
	switch (language) {
		case 'ar':
			return {
				'0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
				'5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
			};
		default:
			return {
				'0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
				'5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
			};
	}
}

function formatNumberString(num: string, language: Language): string {
	const digitMap = getDigitMap(language);
	return num.split('').map(digit => digitMap[digit] || digit).join('');
}

export const useI18nStore = create<I18nState>((set, get) => {
	const initialLanguage = typeof window !== "undefined"
		? getStoredLanguage()
		: defaultLanguage;

	if (typeof window !== "undefined") {
		const cookies = document.cookie.split(";");
		const langCookie = cookies.find((c) => c.trim().startsWith("languageSelected="));
		if (!langCookie) {
			saveLanguageToCookie(initialLanguage);
		}
	}

	return {
		language: initialLanguage,
		translations: {} as Translations,

		loadTranslations: async (lang: Language) => {
			const translations = await loadTranslationFile(lang);
			set({ translations, language: lang });

			if (typeof window !== "undefined") {
				saveLanguageToCookie(lang);

				const isRTL = lang === "ar";
				useThemeStore.getState().setIsRTL(isRTL);
			}
		},

		setLanguage: async (lang: Language) => {
			const { loadTranslations } = get();
			await loadTranslations(lang);

			const isRTL = lang === "ar";
			useThemeStore.getState().setIsRTL(isRTL);
		},

		t: (key: string): string => {
			const { translations } = get();
			const value = getNestedValue(translations as TranslationValue, key);
			return value || key;
		},

		isRTL: (): boolean => {
			const { language } = get();
			return language === "ar";
		},

		getLocale: (): string => {
			const { language } = get();
			return languageToLocale[language] || languageToLocale[defaultLanguage];
		},

		getTimezone: (): string => {
			return getTimezone();
		},

		formatDate: (dateString: string): string => {
			const { language } = get();
			if (!dateString) return '';

			try {
				const date = new Date(dateString);
				if (isNaN(date.getTime())) return dateString;

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');

				if (language === 'ar') {
					const formattedYear = formatNumberString(String(year), language);
					const formattedMonth = formatNumberString(month, language);
					const formattedDay = formatNumberString(day, language);
					return `${formattedDay}.${formattedMonth}.${formattedYear}`;
				}

				return `${day}.${month}.${year}`;
			} catch {
				return dateString;
			}
		},

		formatDateTime: (dateTimeString: string): { date: string; time: string } => {
			const { language } = get();
			if (!dateTimeString) return { date: '', time: '' };

			try {
				const date = new Date(dateTimeString);
				if (isNaN(date.getTime())) return { date: dateTimeString, time: '' };

				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');

				if (language === 'ar') {
					const formattedYear = formatNumberString(String(year), language);
					const formattedMonth = formatNumberString(month, language);
					const formattedDay = formatNumberString(day, language);
					const formattedHours = formatNumberString(hours, language);
					const formattedMinutes = formatNumberString(minutes, language);

					return {
						date: `${formattedDay}.${formattedMonth}.${formattedYear}`,
						time: `${formattedHours}:${formattedMinutes}`
					};
				}

				return {
					date: `${day}.${month}.${year}`,
					time: `${hours}:${minutes}`
				};
			} catch {
				return { date: dateTimeString, time: '' };
			}
		},
	};
});

export async function initializeLanguageFromCookie(): Promise<void> {
	if (typeof window === "undefined") return;

	const storedLanguage = getStoredLanguage();
	const { language: currentLanguage, translations, loadTranslations } = useI18nStore.getState();

	const cookies = document.cookie.split(";");
	const langCookie = cookies.find((c) => c.trim().startsWith("languageSelected="));
	if (!langCookie) {
		saveLanguageToCookie(storedLanguage);
	}

	if (storedLanguage !== currentLanguage) {
		await useI18nStore.getState().setLanguage(storedLanguage);
	} else {
		if (Object.keys(translations).length === 0) {
			await loadTranslations(storedLanguage);
		} else {
			const isRTL = storedLanguage === "ar";
			useThemeStore.getState().setIsRTL(isRTL);
		}
	}
}

export function watchLanguageCookie(): () => void {
	if (typeof window === "undefined") return () => { };

	let lastCookieValue = getStoredLanguage();

	const checkCookie = async () => {
		const currentCookieValue = getStoredLanguage();
		const currentStoreLanguage = useI18nStore.getState().language;

		if (currentCookieValue !== lastCookieValue || currentCookieValue !== currentStoreLanguage) {
			lastCookieValue = currentCookieValue;
			await useI18nStore.getState().setLanguage(currentCookieValue);
		}
	};

	const interval = setInterval(checkCookie, 500);

	return () => clearInterval(interval);
}
