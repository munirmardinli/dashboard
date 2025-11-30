'use client';
import { useEffect, useState, useTransition } from 'react';
import { ConfigAPI } from '@/utils/api';
import { useI18nStore } from '@/stores/i18nStore';
import { useThemeStore } from '@/stores/themeStore';
import { getTheme } from '@/utils/theme';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
	const [fullConfig, setFullConfig] = useState<BasicConfig | null>(null);
	const [isPending, startTransition] = useTransition();
	const { t } = useI18nStore();
	const mode = useThemeStore((s) => s.mode);
	const theme = getTheme(mode);

	useEffect(() => {
		startTransition(async () => {
			const config = await ConfigAPI.getFullConfig();
			setFullConfig(config);
		});
	}, []);

	const handleReset = () => startTransition(() => reset());

	return (
		<div role="alert" aria-live="assertive" aria-label={t("ui.ariaErrorPage")} style={{ padding: '32px 16px', maxWidth: '600px', margin: '0 auto' }}>
			<div style={{ textAlign: 'center', padding: '32px 0' }}>
				<h2 id="error-title" aria-label={t("ui.ariaErrorTitle")} style={{ margin: '0 0 16px', fontSize: '2.5rem', fontWeight: 700, color: theme.text }}>
					{t("ui.ariaErrorTitle")}
				</h2>
				<p aria-describedby="error-title" aria-label={t("ui.ariaErrorDescription")} style={{ margin: '0 0 24px', fontSize: '1rem', color: theme.textSec }}>
					{t("ui.ariaErrorDescription")}
				</p>
				{error?.message && (
					<code style={{ display: 'block', marginBottom: '16px', padding: '16px', backgroundColor: `${theme.primary}1a`, borderRadius: '8px', color: theme.text, fontSize: '0.875rem' }} aria-label={t("ui.error")}>
						{error.message}
					</code>
				)}
				<button
					onClick={handleReset}
					disabled={isPending}
					aria-label={t("ui.tryAgain")}
					aria-describedby="error-title"
					aria-busy={isPending}
					style={{
						padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: isPending ? 'wait' : 'pointer',
						background: theme.primary, color: '#fff', fontSize: '1rem', fontWeight: 500,
						opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s'
					}}
				>
					{isPending ? t("ui.loading") : (fullConfig?.ui?.tryAgain ?? t("ui.tryAgain"))}
				</button>
			</div>
		</div>
	);
}
