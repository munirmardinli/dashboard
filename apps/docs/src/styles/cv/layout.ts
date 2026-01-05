import { colors } from './colors';
import { spacing, padding, margin, borderRadius, borders } from './spacing';

// Layout-Styles
export const layout = {
	// Basis-Seiten
	page: {
		padding: padding.sm,
		fontSize: 10,
		color: colors.textPrimary,
		flexDirection: 'column' as const,
		flexWrap: 'nowrap' as const,
		backgroundColor: colors.background,
	},

	writePage: {
		padding: padding['7xl'],
		fontSize: 10,
		color: colors.textPrimary,
		backgroundColor: colors.background,
		flexDirection: 'column' as const,
	},

	coverSheetPage: {
		padding: 0,
		backgroundColor: colors.background,
		color: colors.textPrimary,
	},

	// Header-Bereiche
	header: {
		marginBottom: margin.xs,
		alignItems: 'center' as const,
		paddingBottom: padding.xs,
		borderBottom: `${borders.thin}px solid ${colors.primary}`,
		position: 'relative' as const,
	},

	headerSection: {
		backgroundColor: colors.backgroundDark,
		padding: padding['8xl'],
		borderBottom: `${borders.thick}px solid ${colors.primary}`,
	},

	headerContainer: {
		flexDirection: 'row' as const,
		justifyContent: 'space-between' as const,
		marginBottom: margin['10xl'],
	},

	// Profil-Bereiche
	profileBlock: {
		alignItems: 'center' as const,
		gap: spacing.md,
	},

	profileContainer: {
		flexDirection: 'row' as const,
		alignItems: 'center' as const,
		marginBottom: margin['9xl'],
	},

	profileImageContainer: {
		width: 60,
		height: 60,
		borderRadius: borderRadius['2xl'],
		border: `${borders.medium}px solid ${colors.primary}`,
		display: 'flex' as const,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		marginBottom: spacing.xs,
		boxShadow: `0 2px 4px rgba(79, 70, 229, 0.3)`,
		backgroundColor: colors.backgroundLight,
	},

	imageContainer: {
		width: 220,
		height: 220,
		marginRight: 50,
		backgroundColor: colors.backgroundLight,
		borderRadius: borderRadius['4xl'],
		border: `${borders.medium}px solid ${colors.primary}`,
		display: 'flex' as const,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		marginBottom: spacing.md,
	},

	// Spalten-Layout
	contentGrid: {
		flexDirection: 'row' as const,
		gap: spacing.md,
		paddingTop: padding.xs,
	},

	leftColumn: {
		width: '40%',
		flexDirection: 'column' as const,
		gap: spacing.md,
		paddingRight: padding.sm,
	},

	rightColumn: {
		width: '60%',
		flexDirection: 'column' as const,
		gap: spacing.md,
		paddingLeft: padding.md,
		paddingRight: padding.md,
		borderLeft: `${borders.thin}px solid ${colors.accent}`,
	},

	leftBlock: {
		flexDirection: 'column' as const,
		maxWidth: '45%',
		gap: spacing.md,
	},

	rightBlockWrapper: {
		flexDirection: 'row' as const,
		maxWidth: '45%',
	},

	rightBlock: {
		flexDirection: 'column' as const,
	},

	nameSection: {
		flex: 1,
	},

	// Content-Bereiche
	contentSection: {
		padding: padding['8xl'],
		flex: 1,
		backgroundColor: colors.background,
	},

	// Sektionen
	section: {
		padding: padding.md,
		backgroundColor: colors.backgroundLight,
		borderRadius: borderRadius.sm,
		marginBottom: spacing.sm,
		border: `${borders.thin}px solid ${colors.accent}`,
		boxShadow: `0 1px 2px rgba(0, 0, 0, 0.1)`,
		position: 'relative' as const,
	},

	// Footer
	footer: {
		backgroundColor: colors.backgroundDark,
		padding: padding['5xl'],
		flexDirection: 'row' as const,
		justifyContent: 'space-between' as const,
		alignItems: 'center' as const,
		borderTop: `${borders.thin}px solid ${colors.accent}`,
	},
} as const;
