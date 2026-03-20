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

import { cookieService } from "@/utils/cookieService";
import { I18nStaticAPI } from "@/utils/api";

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
	const initialLanguage = defaultLanguage;

	return {
		language: initialLanguage,
		translations: {} as Translations,

		loadTranslations: async (lang: Language) => {
			const translations = await I18nStaticAPI.loadTranslations(lang);
			set({ translations, language: lang });

			if (typeof window !== "undefined") {
				cookieService.set({ languageSelected: lang });

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

export async function initializeLanguageFromJson(): Promise<void> {
	if (typeof window === "undefined") return;

	const data = await cookieService.get();
	const langStr = data.languageSelected as string;
	const storedLanguage = (langStr === "de" || langStr === "en" || langStr === "fr" || langStr === "ar") ? (langStr as Language) : defaultLanguage;
	
	const { language: currentLanguage, translations, loadTranslations } = useI18nStore.getState();

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
	return () => { };
}
