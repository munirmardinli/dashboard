import { Router, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();

class RandomPieRouter {
	getRouter(): Router {
		const router = Router();

		router.get("/api/randomPie", this.get.bind(this));

		return router;
	}

	async get(_req: Request, res: Response): Promise<void> {
		const { content } = await github.getFile("management/learn.json");
		res.json(JSON.parse(content));
	}
}

export { RandomPieRouter }
