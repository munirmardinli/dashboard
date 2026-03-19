import { Router, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();
const DASHY_FILE_PATH = "management/dashy.json";

class DashyRouter {
	private async getData(): Promise<DashyData> {
		const { content } = await github.getFile(DASHY_FILE_PATH);
		return JSON.parse(content) as DashyData;
	}

	private async save(data: DashyData): Promise<void> {
		await github.updateFile(DASHY_FILE_PATH, JSON.stringify(data, null, "\t"), "Update dashy");
	}

	getRouter(): Router {
		const router = Router();

		router.get("/api/dashy", this.get.bind(this));
		router.post("/api/dashy/sections/:sectionId/items", this.addItem.bind(this));
		router.put("/api/dashy/sections/:sectionId/items/:itemIndex", this.updateItem.bind(this));
		router.delete("/api/dashy/sections/:sectionId/items/:itemIndex", this.archiveItem.bind(this));

		return router;
	}

	async get(_req: Request, res: Response): Promise<void> {
		res.json(await this.getData());
	}

	async addItem(req: Request, res: Response): Promise<void> {
		const { sectionId = "" } = req.params;
		const data = await this.getData();
		const section = data.sections.find((s) => s.id === sectionId);
		if (!section) throw new Error("Section not found");

		const newItem = req.body as DashyItem;
		section.items.push(newItem);
		await this.save(data);
		res.status(201).json(newItem);
	}

	async updateItem(req: Request, res: Response): Promise<void> {
		const { sectionId = "", itemIndex = "" } = req.params;
		const data = await this.getData();
		const section = data.sections.find((s) => s.id === sectionId);
		const index = parseInt(itemIndex || "", 10);
		if (!section || isNaN(index) || !section.items[index]) throw new Error("Invalid params");

		section.items[index] = { ...section.items[index], ...(req.body as Partial<DashyItem>) } as DashyItem;
		await this.save(data);
		res.json(section.items[index]);
	}

	async archiveItem(req: Request, res: Response): Promise<void> {
		const { sectionId = "", itemIndex = "" } = req.params;
		const data = await this.getData();
		const section = data.sections.find((s) => s.id === sectionId);
		const index = parseInt(itemIndex || "", 10);
		if (!section || isNaN(index) || !section.items[index]) throw new Error("Invalid params");

		section.items[index] = { ...section.items[index], isArchive: true, updatedAt: new Date().toISOString() } as DashyItem;
		await this.save(data);
		res.json({ success: true });
	}
}

export { DashyRouter }
