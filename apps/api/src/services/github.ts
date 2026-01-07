

export class GitHubService {
	private token: string;
	private owner: string;
	public repo: string;
	private branch: string;
	private baseUrl: string;

	constructor() {
		this.token = process.env.GITHUB_TOKEN!;
		this.owner = process.env.GITHUB_OWNER!;
		const repoInput = process.env.GITHUB_REPO!;
		this.repo = repoInput.includes("/") && repoInput.startsWith("http")
			? repoInput.split("/").pop()!
			: repoInput;
		this.branch = process.env.GITHUB_BRANCH!;
		this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents`;

		if (!this.token || !this.owner || !this.repo) {
			console.warn("GitHubService: Missing configuration (GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO)");
		}
	}

	private async fetchGitHub(path: string, options: any = {}) {
		const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
		const url = `${this.baseUrl}/dashboard/${normalizedPath}?ref=${this.branch}`;
		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${this.token}`,
				Accept: "application/vnd.github.v3+json",
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`GitHub API Error: ${response.status} ${JSON.stringify(errorData)}`);
		}

		return response.json();
	}

	async getRawFile(path: string): Promise<{ content: Buffer; sha: string }> {
		const data: any = await this.fetchGitHub(path);
		if (data.type !== "file") {
			throw new Error(`Path ${path} is not a file`);
		}
		const content = Buffer.from(data.content, "base64");
		return { content, sha: data.sha };
	}

	async getFile(path: string): Promise<{ content: string; sha: string }> {
		const { content, sha } = await this.getRawFile(path);
		return { content: content.toString("utf-8"), sha };
	}

	async getDirectoryContents(path: string): Promise<Array<{ name: string; type: "file" | "dir"; sha: string }>> {
		const data: any = await this.fetchGitHub(path);
		if (!Array.isArray(data)) {
			throw new Error(`Path ${path} is not a directory`);
		}
		return data.map((item: any) => ({
			name: item.name,
			type: item.type as "file" | "dir",
			sha: item.sha,
		}));
	}

	async updateFile(path: string, content: string, message: string): Promise<void> {
		let sha: string | undefined;
		try {
			const existing = await this.getFile(path);
			sha = existing.sha;
		} catch (e) {
			// File might not exist yet, which is fine for some cases, 
			// but GitHub update API needs SHA if it exists.
		}

		const body = {
			message,
			content: Buffer.from(content).toString("base64"),
			branch: this.branch,
			sha,
		};

		await this.fetchGitHub(path, {
			method: "PUT",
			body: JSON.stringify(body),
		});
	}
}
