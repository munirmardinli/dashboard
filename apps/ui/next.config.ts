import type { NextConfig } from "next";
import nextra from 'nextra';

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
	reactStrictMode: true,
	trailingSlash: true,
	output: "export",
	//cacheComponents: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? {
			exclude: ['error', 'warn'],
		} : false,
	},
	images: {
		unoptimized: true,
	},
	turbopack: {
		resolveAlias: {
			'next-mdx-import-source-file': './mdx-components.tsx',
			underscore: 'lodash',
		},
		resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json'],
	},
};

export default (withNextra(nextConfig));
