"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DocsAPI } from '@/utils/api';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export function useNavigation() {
	const [unifiedMeta, setUnifiedMeta] = useState<MetaData | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const isDesktop = useIsDesktop();
	const { setIsOpen: setMobileDrawerOpen, setActivePath } = useSidebarStore();
	const [, startTransition] = useTransition();

	const handleNavigation = useCallback((path: string, type: 'doc' | 'data' | 'nav' = 'nav') => {
		let targetPath = '';
		if (type === 'doc') {
			const cleanPath = path.startsWith('docs/') ? path.slice(5) : path;
			targetPath = `/?q=docs&p=${cleanPath}`;
		} else {
			targetPath = path.startsWith('/') ? path : `/?q=${path}`;
		}

		startTransition(() => router.push(targetPath));
		setActivePath(path);
		if (!isDesktop) setMobileDrawerOpen(false);
	}, [router, isDesktop, setMobileDrawerOpen, setActivePath]);

	const fetchNavigation = useCallback(async () => {
		setLoading(true);
		try {
			const meta = await DocsAPI.getMeta();
			setUnifiedMeta(meta);
		} catch (error) {
			console.error("Failed to fetch navigation data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchNavigation();
	}, [fetchNavigation]);

	const transformMetaToNavItem = useCallback((key: string, value: MetaDataValue, parentPath = ''): TranslationNavigationItem | null => {
		const currentPath = parentPath ? `${parentPath}/${key}` : key;

		if ('type' in value && (value.type === 'doc' || value.type === 'data')) {
			const leaf = value as MetaDataLeaf;
			return {
				key: currentPath,
				title: leaf.title || key,
				icon: leaf.type === 'doc' ? '' : '',
				path: leaf.path || currentPath,
				type: leaf.type
			};
		}

		const subItems: TranslationNavigationItem[] = [];
		const folder = value as MetaDataFolder;

		const sortedEntries = Object.entries(folder)
			.filter(([vKey]) => vKey !== 'title' && vKey !== 'type' && vKey !== 'path')
			.sort(([keyA, valA], [keyB, valB]) => {
				const isFolderA = !('type' in (valA as object));
				const isFolderB = !('type' in (valB as object));

				if (isFolderA && !isFolderB) return -1;
				if (!isFolderA && isFolderB) return 1;

				const titleA = (isFolderA ? (valA as MetaDataFolder).title : (valA as MetaDataLeaf).title) || keyA;
				const titleB = (isFolderB ? (valB as MetaDataFolder).title : (valB as MetaDataLeaf).title) || keyB;

				return titleA.localeCompare(titleB);
			});

		sortedEntries.forEach(([vKey, vValue]) => {
			const item = transformMetaToNavItem(vKey, vValue as MetaDataValue, currentPath);
			if (item) subItems.push(item);
		});

		if (subItems.length === 0) return null;

		return {
			key: currentPath,
			title: folder.title || key,
			icon: '',
			type: 'dropdown',
			subItems
		};
	}, []);

	const unifiedNavigation = useCallback((): TranslationNavigationItem[] => {
		const items: TranslationNavigationItem[] = [];

		if (unifiedMeta) {
			const sortedRoot = Object.entries(unifiedMeta).sort(([keyA, valA], [keyB, valB]) => {
				const isFolderA = !('type' in (valA as object));
				const isFolderB = !('type' in (valB as object));

				if (isFolderA && !isFolderB) return -1;
				if (!isFolderA && isFolderB) return 1;

				const titleA = (isFolderA ? (valA as MetaDataFolder).title : (valA as MetaDataLeaf).title) || keyA;
				const titleB = (isFolderB ? (valB as MetaDataFolder).title : (valB as MetaDataLeaf).title) || keyB;

				return titleA.localeCompare(titleB);
			});

			sortedRoot.forEach(([key, value]) => {
				const item = transformMetaToNavItem(key, value as MetaDataValue);
				if (item) items.push(item);
			});
		}

		return items;
	}, [unifiedMeta, transformMetaToNavItem]);

	return {
		navigationItems: unifiedNavigation(),
		loading,
		refresh: fetchNavigation,
		handleNavigation
	};
}
