import { promises as fs } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { sendJSON, sendError } from "../utils/http.js";

async function getDashyData() {
	const projectRoot = cwd();
	const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
	const filePath = path.join(projectRoot, assetsDir, "dashy", "index.json");
	try {
		const fileData = await fs.readFile(filePath, "utf8");
		return JSON.parse(fileData);
	} catch (err: unknown) {
		const anyErr = err as NodeJS.ErrnoException;
		if (anyErr?.code === "ENOENT") {
			throw new Error("Dashy data file not found");
		}
		throw err;
	}
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
];
