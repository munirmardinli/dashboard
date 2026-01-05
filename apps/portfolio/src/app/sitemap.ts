import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next/types';

export const dynamic = 'force-static';

class SitemapManager {

	static getAllFiles(dir: string, fileList: string[] = []): string[] {
		const files = fs.readdirSync(dir);

		files.forEach((file) => {
			const filePath = path.join(dir, file);
			if (fs.statSync(filePath).isDirectory()) {
				fileList = SitemapManager.getAllFiles(filePath, fileList);
			} else {
				fileList.push(filePath);
			}
		});

		return fileList;
	}

	static extractRoutesFromPages(): string[] {
		const appDir = path.join(process.cwd(), 'src/app');
		const files = SitemapManager.getAllFiles(appDir);

		const routes = files
			.map((file) => {
				if (
					file.endsWith('layout.tsx') ||
					file.endsWith('not-found.tsx') ||
					file.includes('sitemap')
				) {
					return null;
				}

				const route = file
					.replace(appDir, '')
					.replace(/\.(tsx|js|ts)$/, '')
					.replace(/\\/g, '/');

				if (
					route.startsWith('/_') ||
					route.includes('[') ||
					route.includes(']')
				) {
					return null;
				}

				let cleanedRoute = route.replace(/\/page$/, '');

				cleanedRoute = cleanedRoute.replace(/\.mdx$/, '');

				return cleanedRoute === '' ? '/' : cleanedRoute;
			})
			.filter((route): route is string => route !== null);

		return routes;
	}

	static generateSitemap(): Promise<MetadataRoute.Sitemap> {
		const routes = SitemapManager.extractRoutesFromPages();
		const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => ({
			url: `/${route}`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: route === '/' ? 1 : 0.8,
		}));

		return Promise.resolve(sitemapEntries);
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	return SitemapManager.generateSitemap();
}
