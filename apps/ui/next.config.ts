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
	pageExtensions: ['md','tsx'],
};

export default nextConfig;
