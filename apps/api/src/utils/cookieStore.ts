import { GitHubService } from './github.js';

const github = new GitHubService();

class CookieStore {
	private readonly PATH = 'docs/cookie.json';
	private writeQueue: Promise<Record<string, unknown>> = Promise.resolve({});

	async read(): Promise<Record<string, unknown>> {
		try {
			const { content } = await github.getFile(this.PATH);
			return JSON.parse(content);
		} catch (err) {
			console.error('Failed to read cookie.json from GitHub:', err);
			return {};
		}
	}

	private async executeWrite(
		updates: Record<string, unknown>,
		retryCount = 0
	): Promise<Record<string, unknown>> {
		try {
			github.invalidateCacheForPath(this.PATH);
			let current: Record<string, unknown>;
			let sha: string | undefined;
			try {
				const file = await github.getFile(this.PATH);
				sha = file.sha;
				current = JSON.parse(file.content) as Record<string, unknown>;
			} catch {
				current = {};
			}
			const next = { ...current, ...updates };
			await github.updateFile(
				this.PATH,
				JSON.stringify(next, null, 2),
				'Update cookie.json via API',
				sha
			);
			return next;
		} catch (err: unknown) {
			if (err instanceof Error && err.message.includes('409 Conflict') && retryCount < 3) {
				console.log(`Retrying GitHub write due to 409 Conflict (attempt ${retryCount + 1})...`);
				await new Promise(r => setTimeout(r, 1000));
				return this.executeWrite(updates, retryCount + 1);
			}
			console.error('Failed to write cookie.json to GitHub:', err);
			throw err;
		}
	}

	async write(updates: Record<string, unknown>): Promise<Record<string, unknown>> {
		this.writeQueue = this.writeQueue
			.catch(() => ({}))
			.then(() => this.executeWrite(updates));
		return this.writeQueue;
	}
}

export { CookieStore };
