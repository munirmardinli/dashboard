import { sendJSON, sendError } from "../utils/http.js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";

async function getConfigData() {
	const projectRoot = cwd();
	const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
	const defaultLang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;

	if (!assetsDir) {
		throw new Error("NEXT_PUBLIC_ASSETS_DIR environment variable is not set");
	}

	if (!defaultLang) {
		throw new Error("NEXT_PUBLIC_DEFAULT_LANGUAGE environment variable is not set");
	}

	const configPath = path.join(projectRoot, assetsDir, `${defaultLang}.json`);
	const configData = await fs.readFile(configPath, "utf8");
	return JSON.parse(configData);
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
				const projectRoot = cwd();
				const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;

				if (!assetsDir) {
					throw new Error("NEXT_PUBLIC_ASSETS_DIR environment variable is not set");
				}

				const translationPath = path.join(projectRoot, assetsDir, `${language}.json`);
				const translationData = await fs.readFile(translationPath, "utf8");
				const translations = JSON.parse(translationData);
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
