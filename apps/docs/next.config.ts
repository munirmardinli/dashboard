import nextra from 'nextra';
import type { NextConfig } from 'next';

const withNextra = nextra({
	defaultShowCopyCode: true,
	codeHighlight: true,
	readingTime: true,
	staticImage: true,
	search: true,
	latex: {
		renderer: 'katex',
		options: {
			macros: {
				'\\RR': '\\mathbb{R}',
			},
		},
	},
	whiteListTagsStyling: ['table', 'thead', 'tbody', 'tr', 'th', 'td'],
});

const nextConfig: NextConfig = {
	output: 'export',
	reactStrictMode: true,
	trailingSlash: true,
	compiler: {
		removeConsole: {
			exclude: ['error', 'warn'],
		},
	},
	images: { unoptimized: true },
	turbopack: {
		resolveAlias: {
			'next-mdx-import-source-file': './mdx-components.tsx',
			underscore: 'lodash',
		},
		resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json'],
	},
};

export default withNextra(nextConfig);
