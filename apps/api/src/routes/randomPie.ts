import { sendJSON, sendError } from "../utils/http.js";
import { GitHubService } from "../services/github.js";

const github = new GitHubService();
const RANDOM_PIE_FILE_PATH = "learn/randomPie.json";

async function getRandomPieData() {
	try {
		const { content } = await github.getFile(RANDOM_PIE_FILE_PATH);
		return JSON.parse(content);
	} catch (err: unknown) {
		throw err;
	}
}

export const randomPieRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/randomPie$/,
		handler: async (_req, res) => {
			try {
				const data = await getRandomPieData();
				sendJSON(res, data);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get random pie data");
			}
		},
	},
];
