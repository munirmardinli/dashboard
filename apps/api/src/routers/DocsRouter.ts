import { Router, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();

type MetaData = Record<string, any>;

export class DocsRouter {

	private cachedMeta: MetaData | null = null;
	private lastCacheTime = 0;
	private readonly CACHE_TTL = 1000 * 60 * 5;
	private titleCache: Record<string, string> = {};

	getRouter(): Router {
		const router = Router();

		router.get("/api/docs/meta", this.getMeta.bind(this));
		router.get("/api/docs/list", this.listDirectory.bind(this));
		router.get("/api/docs/content", this.getContentHandler.bind(this));
		router.get("/api/docs/assets/images/:subPath(*)?", this.getImage.bind(this));
		router.get("/api/docs/assets/pdf/:subPath(*)?", this.getPDF.bind(this));

		return router;
	}

	async getMeta(_req: Request, res: Response): Promise<void> {
		res.json(await this.buildMeta());
	}

	async listDirectory(req: Request, res: Response): Promise<void> {
		const p = (req.query["p"] as string) || "";
		res.json(await this.listDirectoryInternal(p));
	}

	async getContentHandler(req: Request, res: Response): Promise<void> {
		const p = (req.query["p"] as string) || "index";
		res.status(200).set("Content-Type", "text/plain; charset=utf-8").send(await this.getContent(p));
	}

	async getImage(req: Request, res: Response): Promise<void> {
		const { subPath = "" } = req.params;
		const file = req.query["p"] as string;

		if (!file) throw new Error("File path missing");

		const { content } = await this.getAsset(`images/${subPath ? subPath + "/" + file : file}`);

		const ext = file.split(".").pop()?.toLowerCase() || "";
		const mime: Record<string, string> = {
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			svg: "image/svg+xml",
			webp: "image/webp"
		};

		res.status(200).set("Content-Type", mime[ext] || "application/octet-stream").send(content);
	}

	async getPDF(req: Request, res: Response): Promise<void> {
		const { subPath = "" } = req.params;
		const file = req.query["p"] as string;

		if (!file) throw new Error("File path missing");

		const { content } = await this.getAsset(`pdf/${subPath ? subPath + "/" + file : file}`);

		res.status(200).set("Content-Type", "application/pdf").send(content);
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

