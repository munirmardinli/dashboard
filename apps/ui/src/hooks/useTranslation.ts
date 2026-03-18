"use client";

import { useCallback } from "react";
import { useI18nStore } from "@/stores/i18nStore";

export function useTranslation() {
	const { translations, language, setLanguage, t: storeT } = useI18nStore();

	const t = useCallback((key: string): string => {
		return storeT(key);
	}, [storeT]);

	const isRTL = useI18nStore((s) => s.isRTL);
	return {
		t,
		language,
		setLanguage,
		translations,
		isRTL,
		onboarding: translations.onboarding || [],
		navigation: translations.navigation || {},
		dataTypes: translations.dataTypes || {}
	};
}
