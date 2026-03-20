import { Router, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();
const PORTFOLIO_DIR = "portfolio/index.json";

class PortfolioRouter {
	getRouter(): Router {
		const router = Router();

		router.get("/api/portfolio", this.get.bind(this));
		router.get("/api/portfolio/:filename", this.getImage.bind(this));

		return router;
	}

	async get(_req: Request, res: Response): Promise<void> {
		const { content } = await github.getFile(PORTFOLIO_DIR);
		res.json(JSON.parse(content));
	}

	async getImage(req: Request, res: Response): Promise<void> {
		const { filename = "" } = req.params;
		if (!filename) throw new Error("Filename missing");
		const { content } = await github.getRawFile(`${PORTFOLIO_DIR}/${filename}`);
		const ext = filename.split(".").pop()?.toLowerCase() || "";
		const mime: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };
		
		res.status(200)
			.set("Content-Type", mime[ext] || "application/octet-stream")
			.send(content);
	}
}

export { PortfolioRouter }
