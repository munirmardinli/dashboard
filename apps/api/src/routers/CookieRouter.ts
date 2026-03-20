import { Router, type Request, type Response } from 'express';
import { CookieStore } from '../utils/cookieStore.js';

const store = new CookieStore();

export class CookieRouter {
	private router: Router;

	constructor() {
		this.router = Router();
		this.setupRoutes();
	}

	private setupRoutes() {
		this.router.get('/api/cookie', this.get.bind(this));
		this.router.post('/api/cookie', this.post.bind(this));
	}

	private async get(_req: Request, res: Response): Promise<void> {
		try {
			const data = await store.read();
			res.json(data);
		} catch (err) {
			res.status(500).json({ error: 'Failed to read cookie.json' });
		}
	}

	private async post(req: Request, res: Response): Promise<void> {
		try {
			const updates = req.body as Record<string, unknown>;
			const next = await store.write(updates);
			res.json({ success: true, data: next });
		} catch (err) {
			res.status(500).json({ error: 'Failed to write cookie.json' });
		}
	}

	getRouter(): Router {
		return this.router;
	}
}
