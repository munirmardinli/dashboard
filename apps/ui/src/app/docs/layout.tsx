"use client";

import { ReactNode, Suspense, useState } from 'react';
import Sidebar from './Sidebar';
import { getTheme } from '@/utils/theme';
import { useThemeStore } from '@/stores/themeStore';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Menu, X } from 'lucide-react';

export default function DocsLayout({ children }: { children: ReactNode }) {
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);
	const isDesktop = useIsDesktop();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div style={{
			display: 'flex',
			flexDirection: isDesktop ? 'row' : 'column',
			minHeight: 'calc(100vh - 64px)',
			background: theme.bg
		}}>
			{isDesktop && <Sidebar />}

			{!isDesktop && (
				<div style={{
					position: 'sticky',
					top: '64px',
					zIndex: 100,
					background: theme.paper,
					borderBottom: `1px solid ${theme.divider}`,
					padding: '12px 16px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<button
							onClick={() => setMobileMenuOpen(true)}
							style={{
								border: 'none',
								background: 'transparent',
								color: theme.text,
								display: 'flex',
								alignItems: 'center',
								cursor: 'pointer',
								padding: '4px'
							}}
						>
							<Menu size={24} />
						</button>
						<span style={{ fontWeight: 600, color: theme.text }}>Dokumentation</span>
					</div>
				</div>
			)}

			{!isDesktop && mobileMenuOpen && (
				<div style={{ position: 'fixed', inset: 0, zIndex: 1200 }}>
					<div
						onClick={() => setMobileMenuOpen(false)}
						style={{
							position: 'absolute',
							inset: 0,
							background: 'rgba(0,0,0,0.5)',
							backdropFilter: 'blur(4px)'
						}}
					/>
					<div style={{
						position: 'absolute',
						top: 0,
						left: 0,
						bottom: 0,
						width: '280px',
						background: theme.paper,
						boxShadow: `0 0 40px rgba(0,0,0,0.2)`,
						transform: 'translateX(0)',
						transition: 'transform 0.3s ease',
						zIndex: 1201,
						height: '100%'
					}}>
						<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
							<button
								onClick={() => setMobileMenuOpen(false)}
								style={{ border: 'none', background: 'transparent', color: theme.text, cursor: 'pointer' }}
							>
								<X size={24} />
							</button>
						</div>
						<Sidebar mobile onLinkClick={() => setMobileMenuOpen(false)} />
					</div>
				</div>
			)}

			<div style={{ flex: 1, padding: isDesktop ? '32px 48px' : '24px 16px', maxWidth: '100%', overflowX: 'hidden' }}>
				<main style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
					<Suspense fallback={<div>Lade Dokumentation...</div>}>
						{children}
					</Suspense>
				</main>
			</div>
		</div>
	);
}
