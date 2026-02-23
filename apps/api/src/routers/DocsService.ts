import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class DocsService {
	async getMeta() {
		const { content } = await github.getFile("docs/meta.json");
		return JSON.parse(content);
	}

	async getContent(path: string) {
		const { content } = await github.getFile(`docs/${path}.md`);
		return content;
	}

	async getAsset(path: string) {
		return github.getRawFile(`docs/studies/assets/${path}`);
	}
}
