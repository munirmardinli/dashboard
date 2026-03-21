import { Router, type Request, type Response } from 'express';
import { GitHubService } from '../utils/github.js';

export class CookieRouter {
	private router: Router;
	private readonly github = new GitHubService();
	private readonly cookiePath = 'docs/cookie.json';
	private writeQueue: Promise<Record<string, unknown>> = Promise.resolve({});

	constructor() {
		this.router = Router();
		this.setupRoutes();
	}

	private setupRoutes() {
		this.router.get('/api/cookie', this.get.bind(this));
		this.router.post('/api/cookie', this.post.bind(this));
	}

	private async read(): Promise<Record<string, unknown>> {
		try {
			const { content } = await this.github.getFile(this.cookiePath);
			return JSON.parse(content) as Record<string, unknown>;
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
			this.github.invalidateCacheForPath(this.cookiePath);
			let current: Record<string, unknown>;
			let sha: string | undefined;
			try {
				const file = await this.github.getFile(this.cookiePath);
				sha = file.sha;
				current = JSON.parse(file.content) as Record<string, unknown>;
			} catch {
				current = {};
			}
			const next = { ...current, ...updates };
			await this.github.updateFile(
				this.cookiePath,
				JSON.stringify(next, null, 2),
				'Update cookie.json via API',
				sha
			);
			return next;
		} catch (err: unknown) {
			if (err instanceof Error && err.message.includes('409 Conflict') && retryCount < 3) {
				console.log(`Retrying GitHub write due to 409 Conflict (attempt ${retryCount + 1})...`);
				await new Promise((r) => setTimeout(r, 1000));
				return this.executeWrite(updates, retryCount + 1);
			}
			console.error('Failed to write cookie.json to GitHub:', err);
			throw err;
		}
	}

	private async write(updates: Record<string, unknown>): Promise<Record<string, unknown>> {
		this.writeQueue = this.writeQueue
			.catch(() => ({}))
			.then(() => this.executeWrite(updates));
		return this.writeQueue;
	}

	private async get(_req: Request, res: Response): Promise<void> {
		try {
			const data = await this.read();
			res.json(data);
		} catch {
			res.status(500).json({ error: 'Failed to read cookie.json' });
		}
	}

	private async post(req: Request, res: Response): Promise<void> {
		try {
			const updates = req.body as Record<string, unknown>;
			const next = await this.write(updates);
			res.json({ success: true, data: next });
		} catch {
			res.status(500).json({ error: 'Failed to write cookie.json' });
		}
	}

	getRouter(): Router {
		return this.router;
	}
}
