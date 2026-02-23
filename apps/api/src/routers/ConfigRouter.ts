import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON } from "../utils/http.js";
import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class ConfigRouter {
	private async getConfig(): Promise<DashboardConfig> {
		const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de";
		const { content } = await github.getFile(`${lang}.json`);
		return JSON.parse(content) as DashboardConfig;
	}

	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/config$/, handler: this.get.bind(this) },
			{ method: "GET", path: /^\/api\/config\/translations\/(?<language>[a-z]{2})$/, handler: this.getTranslations.bind(this) },
			{ method: "GET", path: /^\/api\/config\/dataType\/(?<dataType>[a-zA-Z0-9-]+)$/, handler: this.getDataType.bind(this) },
			{ method: "GET", path: /^\/api\/config\/navigation$/, handler: this.getNavigation.bind(this) },
			{ method: "GET", path: /^\/api\/config\/onboarding$/, handler: this.getOnboarding.bind(this) },
		];
	}

	async get(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		sendJSON(res, await this.getConfig());
	}

	async getTranslations(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as LanguageRouteParams;
		const { content } = await github.getFile(`${params.language}.json`);
		sendJSON(res, JSON.parse(content));
	}

	async getDataType(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as DataTypeRouteParams;
		const config = await this.getConfig();
		sendJSON(res, config.dataTypes[params.dataType || ""]);
	}

	async getNavigation(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		const config = await this.getConfig();
		sendJSON(res, config.navigation || {});
	}

	async getOnboarding(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		const config = await this.getConfig();
		sendJSON(res, config.onboarding || []);
	}
}
