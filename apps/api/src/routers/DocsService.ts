import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class DocsService {
	private cachedMeta: MetaData | null = null;
	private lastCacheTime = 0;
	private CACHE_TTL = 1000 * 60 * 5;

	async getMeta(): Promise<MetaData> {
		if (this.cachedMeta && Date.now() - this.lastCacheTime < this.CACHE_TTL) {
			return this.cachedMeta;
		}

		try {
			const tree = await github.getTree();
			const docsTree = tree.filter(item => item.path.startsWith("dashboard/docs/") && item.path.endsWith(".md"));
			const meta: MetaData = {};

			for (const item of docsTree) {
				const relativePath = item.path.replace("dashboard/docs/", "").replace(".md", "");
				if (relativePath === "index") continue;

				const parts = relativePath.split("/");
				let current: MetaData = meta;

				for (let i = 0; i < parts.length; i++) {
					const part = parts[i];
					if (!part) continue;
					const isFile = i === parts.length - 1;

					if (isFile) {
						if (part === "index") continue;
						const title = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
						current[part] = title;
					} else {
						if (!current[part]) {
							current[part] = {
								title: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ")
							};
						}
						const next = current[part];
						if (typeof next === "object" && next !== null) {
							current = next as MetaData;
						}
					}
				}
			}

			this.cachedMeta = meta;
			this.lastCacheTime = Date.now();
			return meta;
		} catch (error) {
			console.error("Error building dynamic meta:", error);
			return {};
		}
	}

	async listDirectory(path: string) {
		const fullPath = `docs/${path}`;
		return github.listDirectory(fullPath);
	}

	private extractTitle(content: string, fallback: string): string {
		const fmMatch = content.match(/^title:\s*["']?([^"'\n\r]+)["']?/m);
		if (fmMatch?.[1]) return fmMatch[1].trim();

		const h1Match = content.match(/^#\s+(.+)$/m);
		if (h1Match?.[1]) return h1Match[1].trim();

		return fallback.charAt(0).toUpperCase() + fallback.slice(1).replace(/-/g, " ");
	}

	async getContent(path: string) {
		try {
			const { content } = await github.getFile(`docs/${path}.md`);
			return content;
		} catch (error) {
			console.error(`Error fetching content for ${path}:`, error);
			return null;
		}
	}

	async getAsset(path: string) {
		return github.getRawFile(`docs/studies/assets/${path}`);
	}
}
