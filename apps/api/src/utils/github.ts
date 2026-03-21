export class GitHubService {
	private _config: { token: string; owner: string; repo: string; branch: string; baseUrl: string } | null = null;
	private cache = new Map<string, { data: unknown; expiry: number }>();
	private CACHE_TTL = 1000 * 60 * 5;

	private treeCache: {
		data: { path: string; type: "blob" | "tree"; sha: string }[];
		expiry: number;
	} | null = null;
	private TREE_TTL = 1000 * 60 * 10;

	private get config() {
		if (this._config) return this._config;

		const token = process.env.GITHUB_TOKEN?.trim() || "";
		const owner = process.env.GITHUB_OWNER?.trim() || "";
		const repo = process.env.GITHUB_REPO?.split("/").pop()?.trim() || "";
		const branch = process.env.GITHUB_BRANCH?.trim() || "main";
		const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

		if (!token || !owner || !repo) {
			throw new Error("GitHub configuration missing (TOKEN, OWNER or REPO)");
		}

		this._config = { token, owner, repo, branch, baseUrl };
		return this._config;
	}

	private async delay(ms: number) {
		return new Promise((res) => setTimeout(res, ms));
	}

	/** Drop cached GET for this path so the next read returns current content/sha (avoids 409 on PUT). */
	invalidateCacheForPath(path: string) {
		const p = path.startsWith("/") ? path.slice(1) : path;
		const url = `${this.config.baseUrl}/dashboard/${p}?ref=${this.config.branch}`;
		this.cache.delete(url);
	}

	private async fetchGitHub<T>(path: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.config.baseUrl}/dashboard/${path.startsWith("/") ? path.slice(1) : path}?ref=${this.config.branch}`;

		const cached = this.cache.get(url);
		if (cached && cached.expiry > Date.now() && (!options.method || options.method === "GET")) {
			return cached.data as T;
		}

		const response = await fetch(url, {
			...options,
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${this.config.token}`,
				"X-GitHub-Api-Version": "2022-11-28",
				...options.headers,
			},
		});

		const remaining = Number(response.headers.get("x-ratelimit-remaining") || "1");
		const reset = Number(response.headers.get("x-ratelimit-reset") || "0");

		if (remaining === 0) {
			const waitTime = Math.max(reset * 1000 - Date.now(), 1000);
			await this.delay(waitTime);
			return this.fetchGitHub(path, options);
		}

		if (!response.ok) {
			const text = await response.text();

			if (response.status === 403 && text.includes("rate limit")) {
				const waitTime = Math.max(reset * 1000 - Date.now(), 1000);
				await this.delay(waitTime);
				return this.fetchGitHub(path, options);
			}

			throw new Error(`GitHub Error: ${response.status} ${response.statusText} - ${text}`);
		}

		const data: unknown = await response.json();

		const method = options.method?.toUpperCase();
		if (method && method !== "GET" && method !== "HEAD") {
			this.invalidateCacheForPath(path);
		}

		if (!options.method || options.method === "GET") {
			this.cache.set(url, {
				data,
				expiry: Date.now() + this.CACHE_TTL,
			});
		}

		return data as T;
	}

	private async safeFetch<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
		try {
			return await fn();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			if (retries > 0 && msg.includes("403")) {
				await this.delay(1000);
				return this.safeFetch(fn, retries - 1);
			}
			throw err;
		}
	}

	async getRawFile(path: string): Promise<{ content: Buffer; sha: string }> {
		const data = await this.safeFetch(() =>
			this.fetchGitHub<{ content: string; sha: string; type: string }>(path)
		);
		return { content: Buffer.from(data.content, "base64"), sha: data.sha };
	}

	async getFile(path: string): Promise<{ content: string; sha: string }> {
		const { content, sha } = await this.getRawFile(path);
		return { content: content.toString("utf-8"), sha };
	}

	async updateFile(path: string, content: string, message: string, existingSha?: string): Promise<unknown> {
		this.invalidateCacheForPath(path);
		let sha: string | undefined = existingSha;

		if (sha === undefined) {
			try {
				const existing = await this.getFile(path);
				sha = existing.sha;
			} catch {}
		}

		return this.safeFetch(() =>
			this.fetchGitHub(path, {
				method: "PUT",
				body: JSON.stringify({
					message,
					content: Buffer.from(content).toString("base64"),
					branch: this.config.branch,
					sha,
				}),
			})
		);
	}

	async listDirectory(path: string): Promise<{ name: string; type: "file" | "dir"; path: string }[]> {
		const items = await this.safeFetch(() =>
			this.fetchGitHub<{ name: string; type: "file" | "dir"; path: string }[]>(path)
		);

		return items.map((item) => ({
			name: item.name,
			type: item.type,
			path: item.path.startsWith("dashboard/") ? item.path.slice(10) : item.path,
		}));
	}

	async getTree(recursive = true): Promise<{ path: string; type: "blob" | "tree"; sha: string }[]> {
		if (this.treeCache && this.treeCache.expiry > Date.now()) {
			return this.treeCache.data;
		}

		const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/git/trees/${this.config.branch}?recursive=${recursive ? 1 : 0}`;

		const response = await fetch(url, {
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${this.config.token}`,
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		const remaining = Number(response.headers.get("x-ratelimit-remaining") || "1");
		const reset = Number(response.headers.get("x-ratelimit-reset") || "0");

		if (remaining === 0) {
			const waitTime = Math.max(reset * 1000 - Date.now(), 1000);
			await this.delay(waitTime);
			return this.getTree(recursive);
		}

		if (!response.ok) {
			const text = await response.text();

			if (response.status === 403 && text.includes("rate limit")) {
				const waitTime = Math.max(reset * 1000 - Date.now(), 1000);
				await this.delay(waitTime);
				return this.getTree(recursive);
			}

			throw new Error(`GitHub Error: ${response.status} ${response.statusText} - ${text}`);
		}

		const result = (await response.json()) as {
			tree: { path: string; type: "blob" | "tree"; sha: string }[];
		};

		this.treeCache = {
			data: result.tree,
			expiry: Date.now() + this.TREE_TTL,
		};

		return result.tree;
	}

	async batchGetContent<T>(paths: string[], fn: (path: string) => Promise<T>, batchSize = 5): Promise<T[]> {
		const results: T[] = [];

		for (let i = 0; i < paths.length; i += batchSize) {
			const chunk = paths.slice(i, i + batchSize);

			const chunkResults = await Promise.all(
				chunk.map((p) => this.safeFetch(() => fn(p)))
			);

			results.push(...chunkResults);
			await this.delay(200);
		}

		return results;
	}
}
