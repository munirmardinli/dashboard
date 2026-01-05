import type { MetadataRoute } from 'next/types';

export const dynamic = 'force-static';

class RobotsManager {
	static generateRobots(): MetadataRoute.Robots {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
		if (!baseUrl) {
			throw new Error('NEXT_PUBLIC_BASE_URL is not set');
		}
		return {
			rules: {
				userAgent: '*',
				allow: ['/'],
				disallow: ['/admin', '/privacy', '/user/*'],
			},
			sitemap: `${baseUrl}/sitemap.xml`,
			host: baseUrl,
		};
	}
}

export default function robots(): MetadataRoute.Robots {
	return RobotsManager.generateRobots();
}
