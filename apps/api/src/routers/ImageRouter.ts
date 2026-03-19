import { Router, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();

class ImageRouter {
	getRouter(): Router {
		const router = Router();

		router.get("/api/portfolio/:filepath(*)", this.get.bind(this));

		return router;
	}

	async get(req: Request, res: Response): Promise<void> {
		const { filepath = "" } = req.params;
		if (!filepath) throw new Error("Filepath missing");
		const { content } = await github.getRawFile(`portfolio/${filepath}`);
		const ext = filepath.split(".").pop()?.toLowerCase() || "";
		const mime: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };
		
		res.status(200)
			.set("Content-Type", mime[ext] || "application/octet-stream")
			.send(content);
	}
}

export { ImageRouter }
