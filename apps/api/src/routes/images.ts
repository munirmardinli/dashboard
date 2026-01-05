import { promises as fs } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import { sendError, sendImage } from "../utils/http.js";

function getContentType(filename: string): string {
	const ext = path.extname(filename).toLowerCase();
	const contentTypes: Record<string, string> = {
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".png": "image/png",
		".gif": "image/gif",
		".webp": "image/webp",
		".svg": "image/svg+xml",
	};
	return contentTypes[ext] || "application/octet-stream";
}

export const imageRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/portfolio\/(?<filename>[^/]+\.(jpg|jpeg|png|gif|webp|svg))$/i,
		handler: async (_req, res, ctx) => {
			try {
				const { filename } = ctx.params;
				if (!filename) {
					sendError(res, 400, "Filename is required");
					return;
				}

				if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
					sendError(res, 400, "Invalid filename");
					return;
				}

				const projectRoot = cwd();
				const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR || "dist/assets";
				const normalizedAssetsDir = assetsDir.startsWith("/") ? assetsDir.slice(1) : assetsDir;
				const filePath = path.join(projectRoot, normalizedAssetsDir, "portfolio", filename);

				try {
					await fs.access(filePath);
				} catch {
					sendError(res, 404, "Image not found");
					return;
				}

				const imageBuffer = await fs.readFile(filePath);
				const contentType = getContentType(filename);
				sendImage(res, imageBuffer, contentType);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get image");
			}
		},
	},
];
