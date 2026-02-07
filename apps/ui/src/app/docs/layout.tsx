"use client";

import { ReactNode, Suspense } from 'react';
import Sidebar from './Sidebar';
import { getTheme } from '@/utils/theme';
import { useThemeStore } from '@/stores/themeStore';

export default function DocsLayout({ children }: { children: ReactNode }) {
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: theme.bg }}>
			<div style={{ display: 'flex', flex: 1 }}>
				<Suspense fallback={<div style={{ width: '280px' }}>Lade Sidebar...</div>}>
					<Sidebar />
				</Suspense>
				<main style={{ flex: 1, padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
					<Suspense fallback={<div>Lade Dokumentation...</div>}>
						{children}
					</Suspense>
				</main>
			</div>
		</div>
	);
}
