import { GitHubService } from "./github.js";

export class DocsService {
	private static instance: DocsService;
	private github: GitHubService;

	private constructor() {
		this.github = new GitHubService();
	}

	public static getInstance(): DocsService {
		if (!DocsService.instance) {
			DocsService.instance = new DocsService();
		}
		return DocsService.instance;
	}

	public async getMeta(): Promise<any> {
		try {
			const { content } = await this.github.getFile("docs/meta.json");
			return JSON.parse(content);
		} catch (error) {
			console.error("Error reading docs meta from GitHub:", error);
			throw new Error("Could not read documentation metadata from GitHub");
		}
	}

	public async getContent(path: string): Promise<string> {
		const contentPath = `docs/${path}.md`;

		try {
			const { content } = await this.github.getFile(contentPath);
			return content;
		} catch (error) {
			console.error(`Error reading doc content from GitHub at ${path}:`, error);
			throw new Error("Documentation not found on GitHub");
		}
	}

	public async getAsset(path: string): Promise<{ content: Buffer; sha: string }> {
		const assetPath = `docs/studies/assets/${path}`;
		try {
			return await this.github.getRawFile(assetPath);
		} catch (error) {
			console.error(`Error reading doc asset from GitHub at ${path}:`, error);
			throw new Error("Asset not found on GitHub");
		}
	}
}
