import { colors } from './colors';
import { spacing, padding, margin, borderRadius, borders } from './spacing';

// Komponenten-spezifische Styles
export const components = {
	// Bilder
	profileImage: {
		width: 56,
		height: 56,
		borderRadius: borderRadius.xl,
		objectFit: 'cover' as const,
		objectPosition: '50% 25%',
	},

	coverSheetProfileImage: {
		width: '100%',
		height: '100%',
		borderRadius: borderRadius['4xl'],
		objectFit: 'cover' as const,
		objectPosition: '50% 10%',
	},

	// Kontakt-Bereiche
	contactBlockLeft: {
		flexDirection: 'column' as const,
		alignItems: 'flex-start' as const,
		textAlign: 'left' as const,
		gap: spacing.sm,
		marginBottom: spacing.md,
		paddingLeft: spacing.sm,
		borderLeft: `${borders.thin}px solid ${colors.primary}`,
	},

	contactBlock: {
		flexDirection: 'column' as const,
		alignItems: 'flex-end' as const,
		textAlign: 'right' as const,
		gap: spacing.xs,
	},

	contactInfo: {
		flexDirection: 'column' as const,
		gap: spacing.xl,
	},

	contactItem: {
		flexDirection: 'row' as const,
		alignItems: 'center' as const,
		marginBottom: spacing.sm,
	},

	// Praktikum-Items
	practicumItem: {
		padding: padding.sm,
		backgroundColor: colors.backgroundMedium,
		borderRadius: borderRadius.sm,
		marginBottom: spacing.sm,
		borderLeft: `${borders.medium}px solid ${colors.primary}`,
		boxShadow: `0 1px 2px rgba(0, 0, 0, 0.1)`,
		position: 'relative' as const,
	},

	practicumDepartment: {
		fontWeight: 'bold' as const,
		color: colors.textMuted,
		fontSize: 10,
	},

	practicumText: {
		color: colors.textSecondary,
		fontSize: 10,
		lineHeight: 1.2,
	},

	// Kompetenz-Bereiche
	competenceRow: {
		flexDirection: 'row' as const,
		justifyContent: 'space-between' as const,
		marginBottom: spacing.sm,
		padding: spacing.xs,
		backgroundColor: colors.background,
		borderRadius: borderRadius.sm,
		border: `${borders.thin}px solid ${colors.accent}`,
	},

	competenceKey1: {
		fontSize: 10,
		color: colors.textLight,
		width: '48%',
	},

	competenceKey2: {
		fontSize: 10,
		color: colors.textLight,
		textAlign: 'right' as const,
		width: '48%',
	},

	competenceItem: {
		fontSize: 10,
		color: colors.textLight,
		marginBottom: 2,
		lineHeight: 1.2,
	},

	// Hobby-Bereiche
	hobbiesWrap: {
		flexDirection: 'row' as const,
		flexWrap: 'wrap' as const,
		gap: spacing.xs,
		marginTop: spacing.sm,
	},

	hobbyItem: {
		backgroundColor: colors.primary,
		color: colors.white,
		paddingHorizontal: padding.sm,
		paddingVertical: spacing.xs,
		borderRadius: borderRadius.sm,
		fontSize: 10,
		fontWeight: 'bold' as const,
		boxShadow: `0 1px 2px rgba(79, 70, 229, 0.3)`,
		textTransform: 'uppercase' as const,
		letterSpacing: 0.3,
	},

	// Write-spezifische Komponenten
	senderContactText: {
		fontSize: 10,
		color: colors.textSecondary,
	},

	verticalLine: {
		width: borders.medium,
		backgroundColor: colors.primary,
		marginRight: spacing['2xl'],
		borderRadius: borders.thin,
	},

	smallGap: {
		marginTop: spacing['3xl'],
		marginBottom: spacing['3xl'],
	},

	subjectBlock: {
		marginBottom: spacing['6xl'],
	},

	messageBlock: {
		fontSize: 11,
		color: colors.textSecondary,
		lineHeight: 1.5,
		textAlign: 'justify' as const,
	},

	receiverBlockBottomLeft: {
		flexDirection: 'column' as const,
		alignSelf: 'flex-start' as const,
		justifyContent: 'flex-end' as const,
		marginTop: 'auto' as const,
		gap: spacing.xs,
	},

	senderInfoRow: {
		flexDirection: 'row' as const,
		gap: spacing.md,
		marginBottom: spacing.md,
	},

	// Cover Sheet-spezifische Komponenten
	motivationBox: {
		backgroundColor: colors.backgroundLight,
		padding: padding['7xl'],
		marginBottom: margin['10xl'],
		borderLeft: `${borders['4px']}px solid ${colors.primary}`,
		borderRadius: borderRadius.md,
	},

	attachmentsSection: {
		marginBottom: margin['7xl'],
	},

	attachmentsList: {
		flexDirection: 'column' as const,
		gap: spacing.xl,
	},

	attachmentItem: {
		flexDirection: 'row' as const,
		alignItems: 'center' as const,
		backgroundColor: colors.backgroundLight,
		border: `${borders.thin}px solid ${colors.accent}`,
		borderRadius: borderRadius.md,
		padding: padding['3xl'],
	},

	attachmentIcon: {
		fontSize: 12,
		color: colors.primary,
		marginRight: spacing.xl,
	},

	decorativeAccent: {
		position: 'absolute' as const,
		top: 0,
		right: 0,
		width: 150,
		height: 150,
		backgroundColor: colors.primary,
		opacity: 0.1,
		borderRadius: '0 0 0 75px',
	},

	highlightBox: {
		backgroundColor: colors.backgroundMedium,
		padding: padding['5xl'],
		borderRadius: borderRadius.md,
		marginBottom: margin['7xl'],
		border: `${borders.thin}px solid ${colors.primary}`,
	},
} as const;
