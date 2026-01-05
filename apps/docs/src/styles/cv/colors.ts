// Farb-Variablen für CV Styles
export const colors = {
	// Primärfarben
	primary: '#4f46e5',
	primaryDark: '#3730a3',
	primaryLight: '#6366f1',

	// Hintergrundfarben
	background: '#252525',
	backgroundDark: '#1a1a1a',
	backgroundLight: '#333333',
	backgroundMedium: '#3d3d3d',

	// Textfarben
	textPrimary: '#f0f0f0',
	textSecondary: '#d1d5db',
	textMuted: '#a1a1aa',
	textLight: '#e5e7eb',
	textFooter: '#9ca3af',

	// Akzentfarben
	accent: '#4a4a4a',
	border: '#4f46e5',

	// Spezielle Farben
	white: '#ffffff',
	black: '#000000',
} as const;

// Opacity-Varianten
export const opacity = {
	light: 0.1,
	medium: 0.3,
	heavy: 0.7,
} as const;
