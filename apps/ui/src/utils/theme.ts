export const getTheme = (mode: 'light' | 'dark' | 'contrast'): Theme => {
	const themes: Record<'light' | 'dark' | 'contrast', Theme> = {
		light: {
			primary: '#6366f1', accent: '#10b981', bg: '#f8fafc', paper: 'rgba(255,255,255,0.7)', paperSec: '#ffffff', text: '#1e293b', textSec: '#64748b',
			divider: 'rgba(148,163,184,0.1)', gradient: 'linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)',
			shadowXs: '0 1px 3px rgba(0,0,0,0.08)',
			shadowSm: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
			shadowMd: '0 10px 30px rgba(0,0,0,0.08)',
			shadowLg: '0 20px 60px rgba(0,0,0,0.12)',
			shadowPaper: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
			shadowPrimary: '0 8px 24px rgba(99, 102, 241, 0.25)',
			fontFamily: 'var(--font-roboto-condensed), system-ui, -apple-system, sans-serif',
			fontSizeHero: '3.5rem',
			fontSizeH1: '2.5rem',
			fontSizeBody: '1rem',
			error: '#ef4444',
			errorBg: '#fee2e2',
			success: '#10b981',
			successBg: '#d1fae5',
			warning: '#f59e0b',
			warningBg: '#fef3c7',
			info: '#3b82f6',
			infoBg: '#dbeafe',
			white: '#ffffff',
			brandGradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
		},
		dark: {
			primary: '#6366f1', accent: '#34d399', bg: '#0f172a', paper: 'rgba(15,23,42,0.7)', paperSec: '#1e293b', text: '#f8fafc', textSec: '#94a3b8',
			divider: 'rgba(148,163,184,0.1)', gradient: 'radial-gradient(circle at 50% 0%,#1e1b4b 0%,#0f172a 60%,#020617 100%)',
			shadowXs: '0 1px 3px rgba(0,0,0,0.4)',
			shadowSm: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
			shadowMd: '0 10px 30px rgba(0,0,0,0.4)',
			shadowLg: '0 20px 60px rgba(0,0,0,0.5)',
			shadowPaper: '0px 2px 1px -1px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.28), 0px 1px 3px 0px rgba(0,0,0,0.24)',
			shadowPrimary: '0 8px 24px rgba(99, 102, 241, 0.4)',
			fontFamily: 'var(--font-roboto-condensed), system-ui, -apple-system, sans-serif',
			fontSizeHero: '3.5rem',
			fontSizeH1: '2.5rem',
			fontSizeBody: '1rem',
			error: '#f87171',
			errorBg: 'rgba(239, 68, 68, 0.1)',
			success: '#34d399',
			successBg: 'rgba(16, 185, 129, 0.1)',
			warning: '#fbbf24',
			warningBg: 'rgba(245, 158, 11, 0.1)',
			info: '#60a5fa',
			infoBg: 'rgba(59, 130, 246, 0.1)',
			white: '#ffffff',
			brandGradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)'
		},
		contrast: {
			primary: '#0000ff', accent: '#008000', bg: '#ffffff', paper: '#ffffff', paperSec: '#ffffff', text: '#000000', textSec: '#333333',
			divider: '#000000', gradient: '#ffffff',
			shadowXs: 'none',
			shadowSm: 'none',
			shadowMd: 'none',
			shadowLg: 'none',
			shadowPaper: 'none',
			shadowPrimary: 'none',
			fontFamily: 'var(--font-roboto-condensed), system-ui, -apple-system, sans-serif',
			fontSizeHero: '3.5rem',
			fontSizeH1: '2.5rem',
			fontSizeBody: '1rem',
			error: '#ff0000',
			errorBg: '#ffffff',
			success: '#00ff00',
			successBg: '#ffffff',
			warning: '#ffff00',
			warningBg: '#ffffff',
			info: '#0000ff',
			infoBg: '#ffffff',
			white: '#ffffff',
			brandGradient: 'linear-gradient(135deg, #0000ff 0%, #ff00ff 100%)'
		}
	};
	return themes[mode];
};

export const alpha = (color: string, opacity: number) => {
	const hex = color.replace('#', '');
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	return `rgba(${r},${g},${b},${opacity})`;
};

export const applyTheme = (mode: 'light' | 'dark' | 'contrast') => {
	if (typeof document !== 'undefined') {
		document.documentElement.setAttribute('data-theme', mode);
		const theme = getTheme(mode);
		document.body.style.background = theme.gradient;
		document.body.style.color = theme.text;
	}
};
