import { View, Text } from '@react-pdf/renderer';

import { styles } from '@/styles/cv';

export const renderCompetenceSection = (
	caption: string | null | undefined,
	items: CompetenceItem[] | null | undefined,
	variant: 'default' | 'practicum-style' = 'default'
) => {
	if (!caption || !items?.length) {
		return null;
	}

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>{caption}</Text>
			{items.map((item, idx) =>
				item ? (
					variant === 'practicum-style' ? (
						<View key={idx} style={styles.practicumItem}>
							<Text style={styles.practicumDepartment}>{item.key1}</Text>
							{item.key2 && (
								<Text style={styles.practicumText}>{item.key2}</Text>
							)}
						</View>
					) : (
						<View key={idx} style={styles.competenceRow}>
							<Text style={styles.competenceKey1}>{item.key1}</Text>
							<Text style={styles.competenceKey2}>{item.key2}</Text>
						</View>
					)
				) : null
			)}
		</View>
	);
};
