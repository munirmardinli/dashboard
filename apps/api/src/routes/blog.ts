import { sendJSON, sendError } from "../utils/http.js";
import { GitHubService } from "../services/github.js";

const github = new GitHubService();
const BLOG_FILE_PATH = "learn/blog.json";

async function getBlogData() {
	try {
		const { content } = await github.getFile(BLOG_FILE_PATH);
		const parsedData = JSON.parse(content);

		if (Array.isArray(parsedData)) {
			return { posts: parsedData };
		}

		return parsedData;
	} catch (err: unknown) {
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
