import { StyleSheet, Font } from '@react-pdf/renderer';

import { colors } from './colors';
import { typography } from './typography';
import { layout } from './layout';
import { components } from './components';

// Font-Registrierung
Font.register({
	family: 'Oswald',
	src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

Font.registerEmojiSource({
	format: 'png',
	url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
});

// Alle Styles zusammenführen
export const styles = StyleSheet.create({
	// Layout-Styles
	...layout,

	// Typography-Styles
	...typography,

	// Komponenten-Styles
	...components,

	// Zusätzliche Styles die nicht in die anderen Kategorien passen
	name: {
		...typography.title,
	},

	text: {
		...typography.text,
	},

	sectionTitle: {
		...typography.sectionTitle,
	},

	contactText: {
		...typography.contactText,
	},
});

// Export der einzelnen Module für direkten Zugriff
export { colors, typography, layout, components };
