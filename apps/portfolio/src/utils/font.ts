import { NextFontWithVariable } from 'next/dist/compiled/@next/font';
import { Inter } from 'next/font/google';

const FontCompany: NextFontWithVariable = Inter({
	preload: true,
	subsets: ['latin'],
	variable: '--font-inter',
});

export default class FontManager {
	static getFontCompany(): NextFontWithVariable {
		return FontCompany;
	}

	static FontCompany: NextFontWithVariable = FontCompany;
}
