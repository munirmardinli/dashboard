"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ConfigAPI, DocsAPI } from '@/utils/api';
import { useI18nStore } from '@/stores/i18nStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export function useNavigation() {
	const [navigationConfig, setNavigationConfig] = useState<NavigationConfig | null>(null);
	const [docsMeta, setDocsMeta] = useState<MetaData | null>(null);
	const [loading, setLoading] = useState(true);
	const { t } = useI18nStore();
	const router = useRouter();
	const isDesktop = useIsDesktop();
	const { setIsOpen: setMobileDrawerOpen, setActivePath } = useSidebarStore();
	const [, startTransition] = useTransition();

	const handleNavigation = useCallback((path: string) => {
		const targetPath = path.startsWith('/') ? path : `/?q=${path}`;

		startTransition(() => router.push(targetPath));
		setActivePath(path);
		if (!isDesktop) setMobileDrawerOpen(false);
	}, [router, isDesktop, setMobileDrawerOpen, setActivePath]);

	const fetchNavigation = useCallback(async () => {
		setLoading(true);
		try {
			const [nav, docs] = await Promise.all([
				ConfigAPI.getNavigationConfig(),
				DocsAPI.getMeta()
			]);
			setNavigationConfig(nav);
			setDocsMeta(docs);
		} catch (error) {
			console.error("Failed to fetch navigation data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchNavigation();
	}, [fetchNavigation]);

	const transformDocsToNavItem = useCallback((key: string, value: string | DocFolder, parentPath = ''): TranslationNavigationItem => {
		const currentPath = parentPath ? `${parentPath}/${key}` : key;

		if (typeof value === 'string') {
			return {
				key: currentPath,
				title: value,
				icon: '',
				path: `/?q=docs&p=${currentPath}`
			};
		}

		const subItems: TranslationNavigationItem[] = [];

		if (value.pages) {
			Object.entries(value.pages).forEach(([pKey, pTitle]) => {
				subItems.push({
					key: `${currentPath}/${pKey}`,
					title: pTitle,
					icon: '📄',
					path: `/?q=docs&p=${currentPath}/${pKey}`
				});
			});
		}

		Object.entries(value).forEach(([vKey, vValue]) => {
			if (vKey === 'title' || vKey === 'pages') return;
			subItems.push(transformDocsToNavItem(vKey, vValue as string | DocFolder, currentPath));
		});

		return {
			key: currentPath,
			title: value.title || key,
			icon: '',
			type: 'dropdown',
			subItems
		};
	}, []);

	const unifiedNavigation = useCallback((): TranslationNavigationItem[] => {
		const transformPath = (path: string | undefined): string | undefined => {
			if (!path) return undefined;
			return path.startsWith('/') ? path : `/?q=${path}`;
		};

		const transformItems = (items: TranslationNavigationItem[]): TranslationNavigationItem[] => {
			return items.map(item => ({
				...item,
				path: transformPath(item.path),
				subItems: item.subItems ? transformItems(item.subItems) : undefined
			}));
		};

		const items: TranslationNavigationItem[] = [];

		if (navigationConfig?.mainItems) {
			items.push(...transformItems(navigationConfig.mainItems));
		}

		if (docsMeta) {
			const docsRoot: TranslationNavigationItem = {
				key: 'docs-root',
				title: t("ui.documentation"),
				icon: '📚',
				type: 'dropdown',
				subItems: Object.entries(docsMeta).map(([key, value]) => transformDocsToNavItem(key, value))
			};
			items.push(docsRoot);
		}

		return items;
	}, [navigationConfig, docsMeta, transformDocsToNavItem, t]);

	return {
		navigationItems: unifiedNavigation(),
		loading,
		refresh: fetchNavigation,
		handleNavigation
	};
}
