'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

import { ConfigAPI } from '@/utils/api';
import { useSnackStore } from '@/stores/snackbarStore';
import { useThemeStore } from '@/stores/themeStore';
import { getTheme } from '@/utils/theme';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
	const [fullConfig, setFullConfig] = useState<BasicConfig | null>(null);
	const setSnack = useSnackStore((state) => state.setSnack);
	const router = useRouter();
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	useEffect(() => { ConfigAPI.getFullConfig().then(setFullConfig); }, []);

	const handleRetry = () => {
		try {
			reset();
			setSnack(`${fullConfig?.ui?.applicationIsBeingReloaded ?? ""}`, 'info');
		} catch { setSnack(`${fullConfig?.ui?.errorWhileReloadingApplication ?? ""}`, 'error'); }
	};

	const handleGoHome = () => {
		try { router.push('/'); } catch { setSnack(`${fullConfig?.ui?.errorWhileNavigatingToHomePage ?? ""}`, 'error'); }
	};

	const handleReportBug = () => {
		try {
			console.error('Error Report:', { message: error.message, digest: error.digest, stack: error.stack, timestamp: new Date().toISOString(), url: window.location.href });
			setSnack(`${fullConfig?.ui?.successfully ?? ""}`, 'success');
		} catch { setSnack(`${fullConfig?.ui?.errorWhileCreatingBugReport ?? ""}`, 'error'); }
	};

	return (
		<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, padding: '16px' }}>
			<div style={{ maxWidth: '600px', width: '100%' }}>
				<div style={{
					padding: '32px', textAlign: 'center', borderRadius: '24px', background: theme.paper, backdropFilter: 'blur(10px)',
					border: `1px solid ${theme.divider}`, boxShadow: `0 8px 32px 0 ${theme.primary}40`
				}}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
						<div style={{
							width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
							display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 8px 32px 0 rgba(239,68,68,0.4)'
						}}>
							<AlertCircle size={40} color="white" />
						</div>
						<h1 style={{ margin: '0 0 8px', fontWeight: 600, color: theme.text, fontSize: '2rem' }}>
							{`${fullConfig?.ui?.oopsSomethingWentWrong ?? ""}`}
						</h1>
						<p style={{ margin: '0 0 24px', color: theme.textSec, maxWidth: '400px', fontSize: '1rem' }}>
							{`${fullConfig?.ui?.oopsSomethingWentWrong ?? ""}`} {`${fullConfig?.ui?.weAreWorkingOnFixingTheProblem ?? ""}`}
						</p>
						<div style={{ width: '100%', marginBottom: '24px', padding: '16px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', textAlign: 'left' }}>
							<div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '4px' }}>{`${fullConfig?.ui?.errorDetails ?? ""}`}</div>
							<div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#b91c1c' }}>
								{error.message || `${fullConfig?.ui?.unknownError ?? ""}`}
							</div>
							{error.digest && (
								<div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#dc2626' }}>
									{`${fullConfig?.ui?.errorId ?? ""}`}: {error.digest}
								</div>
							)}
						</div>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
							<button
								onClick={handleRetry}
								style={{
									flex: 1, padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
									background: `linear-gradient(135deg, ${theme.primary} 0%, #4f46e5 100%)`, color: 'white',
									display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', fontWeight: 500
								}}
							>
								<RefreshCw size={20} /> {`${fullConfig?.ui?.tryAgain ?? ""}`}
							</button>
							<button
								onClick={handleGoHome}
								style={{
									flex: 1, padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
									background: 'transparent', border: `1px solid ${theme.primary}`, color: theme.primary,
									display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', fontWeight: 500
								}}
							>
								<Home size={20} /> {`${fullConfig?.ui?.toHomePage ?? ""}`}
							</button>
						</div>
						<div style={{ marginTop: '16px' }}>
							<button
								onClick={handleReportBug}
								title={`${fullConfig?.ui?.createBugReport ?? ""}`}
								style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSec, padding: '8px', borderRadius: '50%' }}
								onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
								onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSec; e.currentTarget.style.background = 'none'; }}
							>
								<Bug size={24} />
							</button>
						</div>
						<div style={{ fontSize: '0.75rem', color: theme.textSec, marginTop: '16px' }}>
							{`${fullConfig?.ui?.ifTheProblemPersistsContactTheSupport ?? ""}`}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
