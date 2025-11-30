'use client';
import { useMemo, useState, useEffect } from 'react';
import { useGlobalLoadingStore } from '@/stores/globalLoadingStore';
import { useI18nStore } from '@/stores/i18nStore';
import { useThemeStore } from '@/stores/themeStore';
import { getTheme } from '@/utils/theme';

export default function Loading() {
	const { loadingMessage } = useGlobalLoadingStore();
	const { t, translations } = useI18nStore();
	const [isMounted, setIsMounted] = useState(false);
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	useEffect(() => { setIsMounted(true); }, []);

	const msg = useMemo(() => {
		if (!isMounted || Object.keys(translations).length === 0) return loadingMessage || "Lädt...";
		return loadingMessage || t("ui.loading");
	}, [loadingMessage, t, translations, isMounted]);

	const shimmer = {
		background: `linear-gradient(90deg, rgba(148,163,184,0.1) 0%, rgba(148,163,184,0.2) 50%, rgba(148,163,184,0.1) 100%)`,
		backgroundSize: '200% 100%',
		animation: 'shimmer 1.5s infinite',
		borderRadius: '4px'
	};

	return (
		<>
			<style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
			<div style={{ padding: '48px 24px', minHeight: '100vh' }}>
				<div style={{ maxWidth: '1200px', margin: '0 auto' }}>
					<div style={{ marginBottom: '32px' }}>
						<div style={{ ...shimmer, width: '40%', height: '40px', marginBottom: '16px' }} />
						<div style={{ ...shimmer, width: '60%', height: '24px' }} />
					</div>
					<div style={{ background: theme.paper, backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px', marginBottom: '24px' }}>
						<div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
							<div style={{ ...shimmer, width: '120px', height: '40px' }} />
							<div style={{ ...shimmer, width: '100px', height: '40px' }} />
							<div style={{ ...shimmer, width: '80px', height: '40px' }} />
						</div>
					</div>
					<div style={{ background: theme.paper, backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px' }}>
						<div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${theme.divider}` }}>
							{[25, 20, 15, 20, 20].map((w, i) => <div key={i} style={{ ...shimmer, width: `${w}%`, height: '32px' }} />)}
						</div>
						{[...Array(5)].map((_, i) => (
							<div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: i < 4 ? `1px solid ${theme.divider}` : 'none' }}>
								{[25, 20, 15, 20].map((w, j) => <div key={j} style={{ ...shimmer, width: `${w}%`, height: '24px' }} />)}
								<div style={{ display: 'flex', gap: '8px' }}>
									{[...Array(3)].map((_, k) => <div key={k} style={{ ...shimmer, width: '32px', height: '32px', borderRadius: '50%' }} />)}
								</div>
							</div>
						))}
					</div>
					<div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
						{[...Array(4)].map((_, i) => <div key={i} style={{ ...shimmer, width: '40px', height: '40px' }} />)}
					</div>
					<div style={{ textAlign: 'center', marginTop: '32px' }}>
						<p style={{ color: theme.primary, fontWeight: 500, animation: 'pulse 2s ease-in-out infinite', margin: 0 }}>{msg}</p>
					</div>
				</div>
			</div>
		</>
	);
}
