"use client";

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { getTheme } from '@/utils/theme';
import { useThemeStore } from '@/stores/themeStore';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';

import { DocsAPI } from '@/utils/api';

export default function Sidebar({ mobile, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const currentPage = searchParams.get('p') || 'index';
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);
	const [meta, setMeta] = useState<MetaData | null>(null);

	useEffect(() => {
		DocsAPI.getMeta().then(data => {
			if (data) setMeta(data);
		});
	}, []);

	if (!meta) return <div style={{ width: mobile ? '100%' : '280px', padding: '24px' }}>Lade Navigation...</div>;

	return (
		<div style={{
			width: mobile ? '100%' : '280px',
			height: mobile ? '100%' : 'calc(100vh - 64px)',
			position: mobile ? 'relative' : 'sticky',
			top: mobile ? 0 : '64px',
			padding: '24px',
			borderRight: mobile ? 'none' : `1px solid ${theme.divider}`,
			display: 'flex',
			flexDirection: 'column',
			gap: '4px',
			overflowY: 'auto',
		}}>
			<ItemRenderer items={meta} theme={theme} currentPage={currentPage} pathname={pathname} onLinkClick={onLinkClick} />
		</div>
	);
}

function ItemRenderer({ items, parentKey = '', theme, currentPage, pathname, onLinkClick }: { items: MetaData; parentKey?: string; theme: Theme; currentPage: string; pathname: string; onLinkClick?: () => void }) {
	return (
		<>
			{Object.entries(items).map(([key, value]) => {
				const currentPath = parentKey ? `${parentKey}/${key}` : key;
				const isActive = currentPage === currentPath;

				if (typeof value === 'object' && value !== null) {
					const title = 'title' in value ? (value.title as string) : key;
					const pages = 'pages' in value ? (value.pages as Record<string, string>) : undefined;
					const { title: _t, pages: _p, ...rest } = value as any;

					return (
						<FolderItem
							key={key}
							title={title}
							pages={pages}
							parentKey={currentPath}
							theme={theme}
							currentPage={currentPage}
							pathname={pathname}
							nestedItems={rest as MetaData}
							onLinkClick={onLinkClick}
						/>
					);
				}

				return (
					<Link
						key={key}
						href={`${pathname}?type=docs&p=${currentPath}`}
						onClick={onLinkClick}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							padding: '8px 12px',
							borderRadius: '8px',
							textDecoration: 'none',
							color: isActive ? theme.primary : theme.text,
							background: isActive ? `${theme.primary}10` : 'transparent',
							fontSize: '14px',
							fontWeight: isActive ? 600 : 400,
							transition: 'all 0.2s ease',
						}}
					>
						<FileText size={16} opacity={isActive ? 1 : 0.6} />
						{String(value)}
					</Link>
				);
			})}
		</>
	);
}

function FolderItem({ title, pages, parentKey, theme, currentPage, pathname, nestedItems, onLinkClick }: FolderItemProps & { pathname: string; onLinkClick?: () => void }) {
	const isActiveBranch = currentPage.startsWith(parentKey);
	const [isOpen, setIsOpen] = useState(isActiveBranch);

	useEffect(() => {
		if (isActiveBranch) {
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	}, [isActiveBranch]);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<div
				onClick={() => setIsOpen(!isOpen)}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '8px 12px',
					cursor: 'pointer',
					color: theme.textSec,
					fontSize: '12px',
					fontWeight: 700,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					marginTop: '12px',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<Folder size={14} />
					{title}
				</div>
				{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
			</div>
			{isOpen && (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '8px', borderLeft: `1px solid ${theme.divider}` }}>
					{pages && typeof pages === 'object' && Object.entries(pages).map(([key, value]) => {
						const currentPath = `${parentKey}/${key}`;
						const isActive = currentPage === currentPath;

						return (
							<Link
								key={key}
								href={`${pathname}?type=docs&p=${currentPath}`}
								onClick={onLinkClick}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									padding: '8px 12px',
									marginLeft: '8px',
									borderRadius: '8px',
									textDecoration: 'none',
									color: isActive ? theme.primary : theme.text,
									background: isActive ? `${theme.primary}10` : 'transparent',
									fontSize: '14px',
									fontWeight: isActive ? 600 : 400,
									transition: 'all 0.2s ease',
								}}
							>
								{String(value)}
							</Link>
						);
					})}
					{nestedItems && (
						<div style={{ marginLeft: '8px' }}>
							<ItemRenderer items={nestedItems} parentKey={parentKey} theme={theme} currentPage={currentPage} pathname={pathname} onLinkClick={onLinkClick} />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
