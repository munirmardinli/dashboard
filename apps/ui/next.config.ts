import type { NextConfig } from "next";

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
		resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json'],
	},
};

export default nextConfig;
