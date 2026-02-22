import { sendError, sendImage } from "../utils/http.js";
import { GitHubService } from "../services/github.js";
import path from "node:path";

const github = new GitHubService();
const PORTFOLIO_DIR = "portfolio";

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
		path: /^\/api\/portfolio\/(?<filepath>(?:[\w-]+\/){0,2}[\w-]+\.(jpg|jpeg|png|gif|webp|svg))$/i,
		handler: async (_req, res, ctx) => {
			try {
				const { filepath } = ctx.params;
				if (!filepath) {
					sendError(res, 400, "File path is required");
					return;
				}

				if (filepath.includes("..")) {
					sendError(res, 400, "Invalid file path");
					return;
				}

				try {
					const { content: buffer } = await github.getRawFile(`${PORTFOLIO_DIR}/${filepath}`);
					const contentType = getContentType(filepath);
					sendImage(res, buffer, contentType);
				} catch (error) {
					sendError(res, 404, "Image not found");
				}
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get image");
			}
		},
	},
];
