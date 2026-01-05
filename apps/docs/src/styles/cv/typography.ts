import { colors } from './colors';
import { spacing } from './spacing';

// Schriftgrößen
export const fontSizes = {
	xs: 7,
	sm: 9,
	base: 9.2,
	md: 10,
	lg: 11,
	xl: 12,
	'2xl': 14,
	'3xl': 22,
	'4xl': 24,
	'5xl': 27,
	'6xl': 30,
} as const;

// Schriftgewichte
export const fontWeights = {
	normal: 'normal',
	bold: 'bold',
	'700': '700',
	'900': '900',
} as const;

// Zeilenhöhen
export const lineHeights = {
	tight: 1.2,
	normal: 1.3,
	relaxed: 1.4,
	loose: 1.5,
} as const;

// Typography-Styles
export const typography = {
	// Basis-Text
	text: {
		color: colors.textSecondary,
		fontSize: fontSizes.base,
		lineHeight: lineHeights.normal,
		marginBottom: 3,
	},

	// Titel
	title: {
		fontSize: fontSizes['4xl'],
		fontWeight: fontWeights['900'],
		textAlign: 'center' as const,
		color: colors.primary,
		textTransform: 'uppercase' as const,
		letterSpacing: 1.5,
		marginBottom: spacing.sm,
		textShadow: `0 1px 2px rgba(79, 70, 229, 0.3)`,
	},

	// Cover Sheet Name
	coverSheetName: {
		fontSize: fontSizes['6xl'],
		fontWeight: fontWeights['900'],
		marginBottom: 5,
		textTransform: 'uppercase' as const,
		color: colors.primary,
		letterSpacing: 1,
	},

	// Sektions-Titel
	sectionTitle: {
		fontSize: fontSizes.md,
		fontWeight: fontWeights.bold,
		color: colors.primary,
		borderBottom: `1px solid ${colors.primary}`,
		marginBottom: spacing.sm,
		paddingBottom: spacing.xs,
		textTransform: 'uppercase' as const,
		letterSpacing: 0.5,
		position: 'relative' as const,
	},

	// Cover Sheet Sektions-Titel
	coverSheetSectionTitle: {
		fontSize: fontSizes['2xl'],
		color: colors.primary,
		marginBottom: 15,
		borderBottom: `1px solid ${colors.primary}`,
		paddingBottom: 5,
	},

	// Write Sektions-Titel
	writeSectionTitle: {
		fontSize: fontSizes.md,
		color: colors.textMuted,
		marginBottom: 6,
	},

	// Kontakt-Text
	contactText: {
		fontSize: fontSizes.base,
		color: colors.textSecondary,
		lineHeight: lineHeights.normal,
	},

	// Write Kontakt-Text
	writeContactText: {
		fontSize: fontSizes.md,
		color: colors.textPrimary,
		marginBottom: 2,
	},

	// Cover Sheet Kontakt-Text
	coverSheetContactText: {
		fontSize: fontSizes.md,
		marginLeft: 8,
		color: colors.textSecondary,
	},

	// Sender Info Text
	senderInfoText: {
		fontSize: fontSizes.xs,
		color: colors.textMuted,
	},

	// Footer Text
	footerText: {
		fontSize: fontSizes.sm,
		color: colors.textFooter,
	},

	// Subject Text
	subjectText: {
		fontSize: fontSizes['2xl'],
		fontWeight: fontWeights['700'],
		color: colors.primary,
		paddingBottom: 4,
	},

	// Message Text
	messageText: {
		fontSize: fontSizes.lg,
		color: colors.textSecondary,
		lineHeight: lineHeights.loose,
		textAlign: 'justify' as const,
	},

	// Motivation Text
	motivationText: {
		fontSize: fontSizes.md,
		lineHeight: lineHeights.relaxed,
		color: colors.textSecondary,
	},

	// Motivation Title
	motivationTitle: {
		fontSize: fontSizes.xl,
		fontWeight: fontWeights.bold,
		color: colors.primary,
		marginBottom: 10,
		textTransform: 'uppercase' as const,
	},

	// Attachment Text
	attachmentText: {
		fontSize: fontSizes.md,
		color: colors.textSecondary,
	},

	// Highlight Text
	highlightText: {
		fontSize: fontSizes.lg,
		color: colors.textPrimary,
		textAlign: 'center' as const,
		fontStyle: 'italic' as const,
	},

	// Job Title
	jobTitle: {
		fontSize: fontSizes['2xl'],
		marginBottom: 20,
		color: colors.textSecondary,
	},

	// Right Name (Write)
	rightName: {
		fontSize: fontSizes['3xl'],
		color: colors.textPrimary,
	},

	// Date Block
	dateBlock: {
		fontSize: fontSizes.md,
		color: colors.textSecondary,
		marginBottom: 20,
		alignSelf: 'flex-end' as const,
		textAlign: 'right' as const,
	},

	// Main Title
	mainTitle: {
		fontSize: fontSizes['4xl'],
		fontWeight: fontWeights.bold,
		color: colors.primary,
		textAlign: 'center' as const,
		marginBottom: 30,
		textTransform: 'uppercase' as const,
		letterSpacing: 1,
		borderBottom: `2px solid ${colors.primary}`,
		paddingBottom: 10,
	},
} as const;
