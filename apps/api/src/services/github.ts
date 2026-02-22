export class GitHubService {
	private token: string | undefined;
	private owner: string;
	public repo: string;
	private branch: string;
	private baseUrl: string;
	private cache: Map<string, { data: any; timestamp: number }> = new Map();
	private readonly CACHE_TTL = 5 * 60 * 1000;

	constructor() {
		this.token = process.env.GITHUB_TOKEN?.trim();
		this.owner = process.env.GITHUB_OWNER?.trim() || "";
		const repoInput = process.env.GITHUB_REPO?.trim() || "";
		this.repo = repoInput.includes("/") && repoInput.startsWith("http")
			? repoInput.split("/").pop()!
			: repoInput;
		this.branch = process.env.GITHUB_BRANCH?.trim() || "main";
		this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents`;

		const tokenLength = this.token?.length || 0;
		const hasToken = !!this.token;
		const configInfo = {
			tokenSet: hasToken,
			tokenLength,
			owner: this.owner || "(nicht gesetzt)",
			repo: this.repo || "(nicht gesetzt)",
			branch: this.branch,
		};

		if (!this.token) {
			throw new Error(
				`GitHubService: GITHUB_TOKEN ist nicht gesetzt oder leer. ` +
				`Bitte setzen Sie die Umgebungsvariable GITHUB_TOKEN mit einem gültigen GitHub Personal Access Token. ` +
				`Konfiguration: ${JSON.stringify(configInfo)}`
			);
		}
		if (!this.owner) {
			throw new Error(
				`GitHubService: GITHUB_OWNER ist nicht gesetzt. ` +
				`Bitte setzen Sie die Umgebungsvariable GITHUB_OWNER mit dem GitHub Benutzernamen oder Organisationsnamen. ` +
				`Konfiguration: ${JSON.stringify(configInfo)}`
			);
		}
		if (!this.repo) {
			throw new Error(
				`GitHubService: GITHUB_REPO ist nicht gesetzt. ` +
				`Bitte setzen Sie die Umgebungsvariable GITHUB_REPO mit dem Repository-Namen. ` +
				`Konfiguration: ${JSON.stringify(configInfo)}`
			);
		}

		if (tokenLength < 20) {
			console.warn(
				`⚠️  GitHubService: GITHUB_TOKEN ist ungewöhnlich kurz (${tokenLength} Zeichen). ` +
				`GitHub Personal Access Tokens sind normalerweise mindestens 40 Zeichen lang. ` +
				`Bitte überprüfen Sie, ob das Token korrekt gesetzt ist.`
			);
		}
	}

	private async fetchGitHub(path: string, options: any = {}) {
		if (!this.token) {
			throw new Error("GitHubService: GITHUB_TOKEN ist nicht verfügbar");
		}

		const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
		const url = `${this.baseUrl}/dashboard/${normalizedPath}?ref=${this.branch}`;

		// Check cache for GET requests
		if (!options.method || options.method === "GET") {
			const cached = this.cache.get(url);
			if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
				return cached.data;
			}
		}

		const headers: Record<string, string> = {
			Accept: "application/vnd.github.v3+json",
			...options.headers,
		};

		if (this.token) {
			headers["Authorization"] = `Bearer ${this.token}`;
		}

		const response = await fetch(url, {
			...options,
			headers,
		});

		if (!response.ok) {
			let errorData: any;
			try {
				errorData = await response.json();
			} catch {
				errorData = { message: response.statusText };
			}

			if (response.status === 401) {
				const tokenLength = this.token?.length || 0;
				const diagnosticInfo = {
					owner: this.owner,
					repo: this.repo,
					branch: this.branch,
					tokenLength,
					url: url.replace(this.token || "", "***"),
				};
				throw new Error(
					`GitHub API Authentifizierungsfehler (401): Das GITHUB_TOKEN ist ungültig oder abgelaufen. ` +
					`Bitte überprüfen Sie das Token in den Umgebungsvariablen. ` +
					`Mögliche Ursachen: Token abgelaufen, falsche Berechtigungen, oder Token wurde widerrufen. ` +
					`Diagnose: ${JSON.stringify(diagnosticInfo)} ` +
					`API Details: ${JSON.stringify(errorData)}`
				);
			}

			throw new Error(`GitHub API Error: ${response.status} ${JSON.stringify(errorData)}`);
		}

		const data = await response.json();

		// Cache successful GET responses
		if (!options.method || options.method === "GET") {
			this.cache.set(url, { data, timestamp: Date.now() });
		} else {
			// Invalidate cache for mutations
			this.cache.clear();
		}

		return data;
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
