import { Router, type NextFunction, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();

type MetaData = Record<string, any>;
type AuthorInfo = { name: string; image: string; role: string };

class DocsRouter {

	private cachedMeta: MetaData | null = null;
	private lastCacheTime = 0;
	private readonly CACHE_TTL = 1000 * 60 * 5;
	private titleCache: Record<string, string> = {};
	private authorCache: AuthorInfo | null = null;
	private metaPromise: Promise<MetaData> | null = null;

	getRouter(): Router {
		const router = Router();

		const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => 
			(req: Request, res: Response, next: NextFunction) => {
				Promise.resolve(fn(req, res)).catch(next);
			};

		router.get("/api/docs/meta", asyncHandler(this.getMeta.bind(this)));
		router.get("/api/docs/list", asyncHandler(this.listDirectory.bind(this)));
		router.get("/api/docs/content", asyncHandler(this.getContentHandler.bind(this)));
		router.get("/api/docs/assets/images/:subPath(*)?", asyncHandler(this.getImage.bind(this)));
		router.get("/api/docs/assets/pdf/:subPath(*)?", asyncHandler(this.getPDF.bind(this)));
		router.get("/api/docs/findonly", asyncHandler(this.findOnlyMeta.bind(this)));

		return router;
	}

	async getMeta(_req: Request, res: Response): Promise<void> {
		if (this.cachedMeta && Date.now() - this.lastCacheTime < this.CACHE_TTL) {
			res.json(this.cachedMeta);
			return;
		}

		if (!this.metaPromise) {
			this.metaPromise = this.buildMeta().finally(() => {
				this.metaPromise = null;
			});
		}

		try {
			res.json(await this.metaPromise);
		} catch (error) {
			res.status(500).json({ error: "Failed to load docs metadata" });
		}
	}

	async findOnlyMeta(req: Request, res: Response): Promise<void> {
		const p = (req.query["p"] as string) || "";
		if (!p) {
			res.status(400).json({ error: "Path parameter 'p' is missing" });
			return;
		}

		try {
			const meta = await this.buildMeta();
			const searchPath = p.startsWith("docs/") ? p : `docs/${p}`;
			const parts = searchPath.split("/");
			let current: any = meta;

			for (const part of parts) {
				if (current && typeof current === 'object' && part in current) {
					current = current[part];
				} else {
					res.status(404).json({ error: `Metadata for path '${p}' (resolved: '${searchPath}') not found` });
					return;
				}
			}

			res.json(current);
		} catch (error) {
			res.status(500).json({ error: "Failed to fetch document metadata" });
		}
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

	private async getAuthor(): Promise<AuthorInfo | null> {
		if (this.authorCache) return this.authorCache;
		try {
			const { content } = await github.getFile("docs/.author.json");
			this.authorCache = JSON.parse(content) as AuthorInfo;
			return this.authorCache;
		} catch (error) {
			console.error("Error fetching .author.json:", error);
			return null;
		}
	}

	private async getContent(path: string) {
		try {
			const { content } = await github.getFile(`docs/${path}.md`);
			const author = await this.getAuthor();

			if (!author) return content;

			const { name, image, role } = author;
			const authorFm = `\nauthor_name: ${name}\nauthor_image: ${image}\nauthor_role: ${role}`;

			if (content.startsWith("---")) {
				const parts = content.split("---");
				if (parts.length >= 3 && parts[1] !== undefined) {
					parts[1] = parts[1].trimEnd() + authorFm + "\n";
					return parts.join("---");
				}
			}

			const titleFallback = path.split("/").pop() || "Document";
			return `---\ntitle: ${titleFallback}${authorFm}\n---\n\n${content}`;
		} catch (error) {
			console.error(`Error fetching content for ${path}:`, error);
			return null;
		}
	}

	private async getAsset(path: string) {
		return github.getRawFile(`docs/studies/assets/${path}`);
	}
}

export { DocsRouter }
