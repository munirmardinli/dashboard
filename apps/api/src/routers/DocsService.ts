import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class DocsService {
	private cachedMeta: MetaData | null = null;
	private lastCacheTime = 0;
	private CACHE_TTL = 1000 * 60 * 5;
	private titleCache: Record<string, string> = {};

	async getMeta(): Promise<MetaData> {
		if (this.cachedMeta && Date.now() - this.lastCacheTime < this.CACHE_TTL) {
			return this.cachedMeta;
		}

		try {
			const tree = await github.getTree();
			const sourceTree = tree.filter(item => {
				const isRelevant = item.path.startsWith("dashboard/") && (item.path.endsWith(".md") || item.path.endsWith(".json"));
				const isRootJson = (item.path.match(/^dashboard\/[a-z]{2}\.json$/));
				const isAsset = item.path.startsWith("dashboard/docs/studies/assets/");
				return isRelevant && !isRootJson && !isAsset;
			});

			const missingItems = sourceTree.filter(item => item.path.endsWith(".md") && !this.titleCache[item.sha]);
			if (missingItems.length > 0) {
				await Promise.all(missingItems.map(async item => {
					const pathForContent = item.path.replace("dashboard/docs/", "").replace(".md", "");
					const content = await this.getContent(pathForContent);
					const key = pathForContent.split("/").pop()! || "";
					this.titleCache[item.sha] = this.extractTitle(content || "", key);
				}));
			}

			const meta: MetaData = {};

			for (const item of sourceTree) {
				const isDocs = item.path.startsWith("dashboard/docs/");
				const isJson = item.path.endsWith(".json");
				const relativePath = item.path.replace("dashboard/", "").replace(/\.(md|json)$/, "");

				const parts = relativePath.split("/");
				let current: any = meta;

				for (let i = 0; i < parts.length; i++) {
					const part = parts[i];
					if (!part) continue;
					const isFile = i === parts.length - 1;
					const isIndex = part === "index";

					if (isFile) {
						if (isIndex && i > 0) {
							const title = isDocs ? (this.titleCache[item.sha] || parts[i - 1]) : parts[i - 1];
							current.title = title;
							continue;
						}

						if (isIndex && i === 0) continue;

						const title = isDocs ? (this.titleCache[item.sha] || part) : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
						current[part] = {
							title,
							type: isJson ? 'data' : 'doc',
							path: isDocs ? relativePath : part
						};
					} else {
						if (!current[part]) {
							current[part] = {
								title: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ")
							};
						}
						current = current[part];
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
