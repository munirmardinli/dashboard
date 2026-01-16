export const getTheme = (mode: 'light' | 'dark' | 'contrast') => {
	const themes = {
		light: {
			primary: '#6366f1', accent: '#10b981', bg: '#f8fafc', paper: 'rgba(255,255,255,0.7)', paperSec: '#ffffff', text: '#1e293b', textSec: '#64748b',
			divider: 'rgba(148,163,184,0.1)', gradient: 'linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)',
			shadowSm: '0 4px 6px rgba(0,0,0,0.02)', shadowMd: '0 10px 30px rgba(0,0,0,0.08)', shadowLg: '0 20px 60px rgba(0,0,0,0.12)',
			shadowPrimary: '0 8px 24px rgba(99, 102, 241, 0.25)'
		},
		dark: {
			primary: '#6366f1', accent: '#34d399', bg: '#0f172a', paper: 'rgba(15,23,42,0.7)', paperSec: '#1e293b', text: '#f8fafc', textSec: '#94a3b8',
			divider: 'rgba(148,163,184,0.1)', gradient: 'radial-gradient(circle at 50% 0%,#1e1b4b 0%,#0f172a 60%,#020617 100%)',
			shadowSm: '0 4px 6px rgba(0,0,0,0.2)', shadowMd: '0 10px 30px rgba(0,0,0,0.4)', shadowLg: '0 20px 60px rgba(0,0,0,0.5)',
			shadowPrimary: '0 8px 24px rgba(99, 102, 241, 0.4)'
		},
		contrast: {
			primary: '#0000ff', accent: '#008000', bg: '#ffffff', paper: '#ffffff', paperSec: '#ffffff', text: '#000000', textSec: '#333333',
			divider: '#000000', gradient: '#ffffff',
			shadowSm: 'none', shadowMd: 'none', shadowLg: 'none',
			shadowPrimary: 'none'
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
