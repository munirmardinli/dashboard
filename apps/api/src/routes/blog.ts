import { promises as fs } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { sendJSON, sendError } from "../utils/http.js";

async function getBlogData() {
	const projectRoot = cwd();
	const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
	const filePath = path.join(projectRoot, assetsDir, "portfolio", "blog.json");
	try {
		const fileData = await fs.readFile(filePath, "utf8");
		const parsedData = JSON.parse(fileData);

		if (Array.isArray(parsedData)) {
			return { posts: parsedData };
		}

		return parsedData;
	} catch (err: unknown) {
		const anyErr = err as NodeJS.ErrnoException;
		if (anyErr?.code === "ENOENT") {
			throw new Error("Blog data file not found");
		}
		throw err;
	}
}

export const blogRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/blog$/,
		handler: async (_req, res) => {
			try {
				const data = await getBlogData();
				sendJSON(res, data);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get blog data");
			}
		},
	},
];
