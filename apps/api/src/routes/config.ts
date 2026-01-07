import { sendJSON, sendError } from "../utils/http.js";
import { GitHubService } from "../services/github.js";

const github = new GitHubService();

async function getConfigData() {
	const defaultLang = process.env["NEXT_PUBLIC_DEFAULT_LANGUAGE"];

	if (!defaultLang) {
		throw new Error("NEXT_PUBLIC_DEFAULT_LANGUAGE environment variable is not set");
	}

	const configPath = `${defaultLang}.json`;
	const { content } = await github.getFile(configPath);
	return JSON.parse(content);
}

export const configRoutes: Route[] = [
	{
		method: "GET",
		path: /^\/api\/config$/,
		handler: async (_req, res) => {
			try {
				const config = await getConfigData();
				sendJSON(res, config);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get config");
			}
		},
	},
	{
		method: "GET",
		path: /^\/api\/config\/translations\/(?<language>[a-z]{2})$/,
		handler: async (_req, res, ctx) => {
			try {
				const { language } = ctx.params;
				const translationPath = `${language}.json`;
				const { content } = await github.getFile(translationPath);
				const translations = JSON.parse(content);
				sendJSON(res, translations);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get translations");
			}
		},
	},
	{
		method: "GET",
		path: /^\/api\/config\/dataType\/(?<dataType>[a-zA-Z0-9-]+)$/,
		handler: async (_req, res, ctx) => {
			try {
				const { dataType } = ctx.params;
				if (!dataType) {
					sendError(res, 400, "Data type parameter is required");
					return;
				}
				const config = await getConfigData();
				const dataTypes = config.dataTypes;
				if (!dataTypes || !(dataType in dataTypes)) {
					sendError(res, 404, "Data type not found");
					return;
				}
				const dtCfg = dataTypes[dataType];
				if (!dtCfg) {
					sendError(res, 404, "Data type not found");
					return;
				}
				sendJSON(res, dtCfg);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get data type config");
			}
		},
	},
	{
		method: "GET",
		path: /^\/api\/config\/navigation$/,
		handler: async (_req, res) => {
			try {
				const config = await getConfigData();
				const navigation = config.navigation || {};
				sendJSON(res, navigation);
			} catch (error) {
				sendError(res, 500, error instanceof Error ? error.message : "Failed to get navigation config");
			}
		},
	},
];
