import { GitHubService } from './github.js';

const github = new GitHubService();

export class CookieStore {
	private readonly PATH = 'docs/cookie.json';

	async read(): Promise<Record<string, unknown>> {
		try {
			const { content } = await github.getFile(this.PATH);
			return JSON.parse(content);
		} catch (err) {
			console.error('Failed to read cookie.json from GitHub:', err);
			return {};
		}
	}

	async write(updates: Record<string, unknown>): Promise<Record<string, unknown>> {
		try {
			const current = await this.read();
			const next = { ...current, ...updates };
			await github.updateFile(this.PATH, JSON.stringify(next, null, 2), 'Update cookie.json via API');
			return next;
		} catch (err) {
			console.error('Failed to write cookie.json to GitHub:', err);
			throw err;
		}
	}
}
