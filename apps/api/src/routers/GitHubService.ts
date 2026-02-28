export class GitHubService {
	private token = process.env.GITHUB_TOKEN?.trim();
	private owner = process.env.GITHUB_OWNER?.trim() || "";
	private repo = process.env.GITHUB_REPO?.split("/").pop()?.trim() || "";
	private branch = process.env.GITHUB_BRANCH?.trim() || "main";
	private baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents`;

	constructor() {
		if (!this.token || !this.owner || !this.repo) {
			throw new Error("GitHub configuration missing (TOKEN, OWNER or REPO)");
		}
	}

	private async fetchGitHub<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}/dashboard/${path.startsWith("/") ? path.slice(1) : path}?ref=${this.branch}`;
		const response = await fetch(url, {
			...options,
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${this.token}`,
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
				branch: this.branch,
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
		const url = `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${this.branch}?recursive=${recursive ? 1 : 0}`;
		const response = await fetch(url, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${this.token}`,
			},
		});

		if (!response.ok) throw new Error(`GitHub Error: ${response.status} ${response.statusText}`);
		const result = await response.json();
		return result.tree;
	}
}
