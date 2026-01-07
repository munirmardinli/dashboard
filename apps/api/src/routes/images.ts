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

				try {
					const { content: buffer } = await github.getRawFile(`${PORTFOLIO_DIR}/${filename}`);
					const contentType = getContentType(filename);
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
