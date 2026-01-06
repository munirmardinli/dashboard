import { promises as fs } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { sendJSON, sendError } from "../utils/http.js";

async function getDashyData(): Promise<DashyData> {
	const projectRoot = cwd();
	const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
	const filePath = path.join(projectRoot, assetsDir, "dashy", "index.json");
	try {
		const fileData = await fs.readFile(filePath, "utf8");
		return JSON.parse(fileData) as DashyData;
	} catch (err: unknown) {
		const fileErr = err as NodeJS.ErrnoException;
		if (fileErr?.code === "ENOENT") {
			throw new Error("Dashy data file not found");
		}
		throw err;
	}
}

async function saveDashyData(data: DashyData): Promise<void> {
	const projectRoot = cwd();
	const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
	const filePath = path.join(projectRoot, assetsDir, "dashy", "index.json");
	await fs.writeFile(filePath, JSON.stringify(data, null, "\t"), "utf8");
}

export const dashyRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/dashy$/,
		handler: async (_req, res) => {
			try {
				const data = await getDashyData();
				sendJSON(res, data);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get dashy data");
			}
		},
	},
	{
		method: "POST",
		path: /^\/api\/dashy\/sections\/(?<sectionId>[^/]+)\/items$/,
		handler: async (_req, res, ctx) => {
			try {
				const { sectionId } = ctx.params;
				if (!sectionId) {
					sendError(res, 400, "Section ID is required");
					return;
				}
				const data = await getDashyData();
				const section = data.sections.find((s: DashySection) => s.id === sectionId);
				if (!section) {
					sendError(res, 404, "Section not found");
					return;
				}
				const newItem = ctx.body as DashyItem;
				if (!newItem.name || !newItem.url) {
					sendError(res, 400, "Item must have name and url");
					return;
				}
				section.items.push(newItem);
				await saveDashyData(data);
				sendJSON(res, newItem, 201);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to create item");
			}
		},
	},
	{
		method: "PUT",
		path: /^\/api\/dashy\/sections\/(?<sectionId>[^/]+)\/items\/(?<itemIndex>[^/]+)$/,
		handler: async (_req, res, ctx) => {
			try {
				const { sectionId, itemIndex } = ctx.params;
				if (!sectionId || itemIndex === undefined) {
					sendError(res, 400, "Section ID and item index are required");
					return;
				}
				const data = await getDashyData();
				const section = data.sections.find((s: DashySection) => s.id === sectionId);
				if (!section) {
					sendError(res, 404, "Section not found");
					return;
				}
				const index = parseInt(itemIndex, 10);
				if (index < 0 || index >= section.items.length) {
					sendError(res, 404, "Item not found");
					return;
				}
				const updatedItem = ctx.body as Partial<DashyItem>;
				if (!updatedItem.name || !updatedItem.url) {
					sendError(res, 400, "Item must have name and url");
					return;
				}
				const finalItem: DashyItem = {
					name: updatedItem.name,
					url: updatedItem.url,
					icon: updatedItem.icon,
					iconUrl: updatedItem.iconUrl,
				};
				section.items[index] = finalItem;
				await saveDashyData(data);
				sendJSON(res, section.items[index]);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to update item");
			}
		},
	},
	{
		method: "DELETE",
		path: /^\/api\/dashy\/sections\/(?<sectionId>[^/]+)\/items\/(?<itemIndex>[^/]+)$/,
		handler: async (_req, res, ctx) => {
			try {
				const { sectionId, itemIndex } = ctx.params;
				if (!sectionId || itemIndex === undefined) {
					sendError(res, 400, "Section ID and item index are required");
					return;
				}
				const data = await getDashyData();
				const section = data.sections.find((s: DashySection) => s.id === sectionId);
				if (!section) {
					sendError(res, 404, "Section not found");
					return;
				}
				const index = parseInt(itemIndex, 10);
				if (index < 0 || index >= section.items.length) {
					sendError(res, 404, "Item not found");
					return;
				}
				const item = section.items[index] as DashyItem;
				if (!item.name || !item.url) {
					sendError(res, 400, "Item is missing required fields");
					return;
				}
				section.items[index] = {
					...item,
					isArchive: true,
					updatedAt: new Date().toISOString(),
				} as DashyItem;
				await saveDashyData(data);
				sendJSON(res, { success: true, message: "Item archived successfully" });
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to archive item");
			}
		},
	},
];
