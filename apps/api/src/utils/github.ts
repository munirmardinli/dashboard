export class GitHubService {
	private _config: { token: string; owner: string; repo: string; branch: string; baseUrl: string } | null = null;

	private get config() {
		if (this._config) return this._config;

		const token = process.env.GITHUB_TOKEN?.trim() || "";
		const owner = process.env.GITHUB_OWNER?.trim() || "";
		const repo = process.env.GITHUB_REPO?.split("/").pop()?.trim() || "";
		const branch = process.env.GITHUB_BRANCH?.trim() || "main";
		const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

		if (!token || !owner || !repo) {
			console.error("❌ GitHub configuration missing:", { token: !!token, owner: !!owner, repo: !!repo });
			throw new Error("GitHub configuration missing (TOKEN, OWNER or REPO)");
		}

		this._config = { token, owner, repo, branch, baseUrl };
		return this._config;
	}

	constructor() {
	}

	private async fetchGitHub<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.config.baseUrl}/dashboard/${path.startsWith("/") ? path.slice(1) : path}?ref=${this.config.branch}`;
		const response = await fetch(url, {
			...options,
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${this.config.token}`,
				...options.headers,
			},
		});

		if (!response.ok) throw new Error(`GitHub Error: ${response.status} ${response.statusText}`);
		return response.json();
	}

	async getRawFile(path: string): Promise<{ content: Buffer; sha: string }> {
		const data = await this.fetchGitHub<{ content: string; sha: string; type: string }>(path);
		return { content: Buffer.from(data.content, "base64"), sha: data.sha };
	}

	async getFile(path: string): Promise<{ content: string; sha: string }> {
		const { content, sha } = await this.getRawFile(path);
		return { content: content.toString("utf-8"), sha };
	}

	async updateFile(path: string, content: string, message: string): Promise<unknown> {
		let sha: string | undefined;
		try {
			const existing = await this.getFile(path);
			sha = existing.sha;
		} catch { }

		return this.fetchGitHub(path, {
			method: "PUT",
			body: JSON.stringify({
				message,
				content: Buffer.from(content).toString("base64"),
				branch: this.config.branch,
				sha,
			}),
		});
	}

	async listDirectory(path: string): Promise<{ name: string; type: "file" | "dir"; path: string }[]> {
		const items = await this.fetchGitHub<{ name: string; type: "file" | "dir"; path: string }[]>(path);
		return items.map(item => ({
			name: item.name,
			type: item.type,
			path: item.path.startsWith("dashboard/") ? item.path.slice(10) : item.path
		}));
	}

	async getTree(recursive = true): Promise<{ path: string; type: "blob" | "tree"; sha: string }[]> {
		const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/trees/${this.config.branch}?recursive=${recursive ? 1 : 0}`;
		const response = await fetch(url, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${this.config.token}`,
			},
		});

		if (!response.ok) throw new Error(`GitHub Error: ${response.status} ${response.statusText}`);
		const result = await response.json();
		return result.tree;
	}
}
