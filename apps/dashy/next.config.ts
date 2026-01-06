import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  output: "export",
  basePath: process.env.NODE_ENV === 'production' ? '/dashy' : '',
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
