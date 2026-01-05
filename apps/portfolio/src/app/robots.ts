import type { MetadataRoute } from 'next/types';

export const dynamic = 'force-static';

class RobotsManager {
	static generateRobots(): MetadataRoute.Robots {
		return {
			rules: {
				userAgent: '*',
				allow: ['/'],
				disallow: ['/admin', '/privacy', '/user/*'],
			},
			sitemap: `/portfolio/sitemap.xml`,
			host: '/',
		};
	}
}

export default function robots(): MetadataRoute.Robots {
	return RobotsManager.generateRobots();
}
