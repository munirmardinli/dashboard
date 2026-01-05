import type { MetadataRoute } from 'next/types';
import Package from 'package.json';

export const dynamic = 'force-static';

class ManifestManager {
	static generateManifest(): MetadataRoute.Manifest {
		return {
			name: Package.name,
			short_name: Package.name,
			description: Package.description,
			start_url: `/`,
			display: 'standalone',
			background_color: '#fff',
			theme_color: '#fff',

			icons: [
				{
					src: `/favicon.ico`,
					sizes: 'any',
					type: 'image/x-icon',
				},
				{
					src: `/android-chrome-192x192.png`,
					sizes: "192x192",
					type: "image/png"
				},
				{
					src: `/android-chrome-512x512.png`,
					sizes: "512x512",
					type: "image/png"
				}
			],
		};
	}
}

export default function manifest(): MetadataRoute.Manifest {
	return ManifestManager.generateManifest();
}
