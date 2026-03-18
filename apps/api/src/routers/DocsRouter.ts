import type { IncomingMessage, ServerResponse } from "node:http";
import { GitHubService } from "../utils/github.js";
import { sendJSON } from "../utils/http.js";

const github = new GitHubService();

export class DocsRouter {
	private cachedMeta: MetaData | null = null;
	private lastCacheTime = 0;
	private readonly CACHE_TTL = 1000 * 60 * 5;
	private titleCache: Record<string, string> = {};

	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/docs\/meta$/, handler: this.getMeta.bind(this) },
			{ method: "GET", path: /^\/api\/docs\/list$/, handler: this.listDirectory.bind(this) },
			{ method: "GET", path: /^\/api\/docs\/content$/, handler: this.getContentHandler.bind(this) },
			{ method: "GET", path: /^\/api\/docs\/assets\/images(?:\/(?<subPath>.*))?$/, handler: this.getImage.bind(this) },
			{ method: "GET", path: /^\/api\/docs\/assets\/pdf(?:\/(?<subPath>.*))?$/, handler: this.getPDF.bind(this) },
		];
	}

	async getMeta(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		sendJSON(res, await this.buildMeta());
	}

	async listDirectory(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const p = ctx.query["p"] || "";
		sendJSON(res, await this.listDirectoryInternal(p));
	}

	async getContentHandler(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const p = ctx.query["p"] || "index";
		res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		res.end(await this.getContent(p));
	}

	async getImage(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as DocsRouteParams;
		const sub = params.subPath || "";
		const file = ctx.query["p"];

		if (!file) throw new Error("File path missing");

		const { content } = await this.getAsset(`images/${sub ? sub + "/" + file : file}`);

		const ext = file.split(".").pop()?.toLowerCase() || "";
		const mime: Record<string, string> = {
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			svg: "image/svg+xml",
			webp: "image/webp"
		};

		res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
		res.end(content);
	}

	async getPDF(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as DocsRouteParams;
		const sub = params.subPath || "";
		const file = ctx.query["p"];

		if (!file) throw new Error("File path missing");

		const { content } = await this.getAsset(`pdf/${sub ? sub + "/" + file : file}`);

		res.writeHead(200, { "Content-Type": "application/pdf" });
		res.end(content);
	}

	private async buildMeta(): Promise<MetaData> {
		if (this.cachedMeta && Date.now() - this.lastCacheTime < this.CACHE_TTL) {
			return this.cachedMeta;
		}

		try {
			const tree = await github.getTree();

			const sourceTree = tree.filter(item => {
				const isRelevant = item.path.startsWith("dashboard/") &&
					(item.path.endsWith(".md") || item.path.endsWith(".json"));

				const isRootJson = item.path.match(/^dashboard\/[a-z]{2}\.json$/);
				const isAsset = item.path.startsWith("dashboard/docs/studies/assets/");

				return isRelevant && !isRootJson && !isAsset;
			});

			const missingItems = sourceTree.filter(
				item => item.path.endsWith(".md") && !this.titleCache[item.sha]
			);

			if (missingItems.length > 0) {
				await Promise.all(
					missingItems.map(async item => {
						const pathForContent = item.path
							.replace("dashboard/docs/", "")
							.replace(".md", "");

						const content = await this.getContent(pathForContent);
						const key = pathForContent.split("/").pop()!;

						this.titleCache[item.sha] =
							this.extractTitle(content || "", key);
					})
				);
			}

			const meta: MetaData = {};

			for (const item of sourceTree) {
				const isDocs = item.path.startsWith("dashboard/docs/");
				const isJson = item.path.endsWith(".json");

				const relativePath = item.path
					.replace("dashboard/", "")
					.replace(/\.(md|json)$/, "");

				const parts = relativePath.split("/");
				let current: any = meta;

				for (let i = 0; i < parts.length; i++) {
					const part = parts[i];
					if (!part) continue;

					const isFile = i === parts.length - 1;
					const isIndex = part === "index";

					if (isFile) {
						if (isIndex && i > 0) {
							const title = isDocs
								? (this.titleCache[item.sha] || parts[i - 1])
								: parts[i - 1];

							current.title = title;
							continue;
						}

						if (isIndex && i === 0) continue;

						const title = isDocs
							? (this.titleCache[item.sha] || part)
							: part.charAt(0).toUpperCase() +
							part.slice(1).replace(/-/g, " ");

						current[part] = {
							title,
							type: isJson ? "data" : "doc",
							path: isDocs ? relativePath : part
						};
					} else {
						if (!current[part]) {
							current[part] = {
								title: part.charAt(0).toUpperCase() +
									part.slice(1).replace(/-/g, " ")
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

	private async listDirectoryInternal(path: string) {
		return github.listDirectory(`docs/${path}`);
	}

	private extractTitle(content: string, fallback: string): string {
		const fmMatch = content.match(/^title:\s*["']?([^"'\n\r]+)["']?/m);
		if (fmMatch?.[1]) return fmMatch[1].trim();

		const h1Match = content.match(/^#\s+(.+)$/m);
		if (h1Match?.[1]) return h1Match[1].trim();

		return fallback.charAt(0).toUpperCase() +
			fallback.slice(1).replace(/-/g, " ");
	}

	private async getContent(path: string) {
		try {
			const { content } = await github.getFile(`docs/${path}.md`);
			return content;
		} catch (error) {
			console.error(`Error fetching content for ${path}:`, error);
			return null;
		}
	}

	private async getAsset(path: string) {
		return github.getRawFile(`docs/studies/assets/${path}`);
	}
}
