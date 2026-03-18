import type { IncomingMessage, ServerResponse } from "node:http";
import { GitHubService } from "../utils/github.js";
import { generateVCF } from "../utils/vcf.js";
import { sendJSON, sendVCF } from "../utils/http.js";
import fs from "node:fs/promises";
import path from "node:path";

const github = new GitHubService();

export class ContactsRouter {
	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/contacts$/, handler: this.list.bind(this) },
			{ method: "GET", path: /^\/api\/vcf\/(?<name>[^/]+)\.vcf$/, handler: this.download.bind(this) },
		];
	}

	async list(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		const data = await this.getContactsList();
		sendJSON(res, data);
	}

	async download(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as { name: string };
		const name = params.name || "";

		try {
			const vcf = await this.getVCF(name);
			sendVCF(res, vcf, `${name}.vcf`);
		} catch (error) {
			sendJSON(res, { error: `Failed to generate VCF for ${name}` }, 500);
		}
	}

	private async getVCF(name: string): Promise<string> {
		const { content } = await github.getFile(`management/contacts/${name}.json`);
		const contacts = JSON.parse(content) as Contact[];
		const vcf = generateVCF(contacts);

		await this.saveVCFLocally(name, vcf);
		return vcf;
	}

	private async getContactsList(): Promise<{ name: string; url: string }[]> {
		const items = await github.listDirectory("management/contacts");

		return items
			.filter(item => item.type === "file" && item.name.endsWith(".json"))
			.map(item => {
				const name = item.name.replace(".json", "");
				return {
					name,
					url: `/api/vcf/${name}.vcf`
				};
			});
	}

	private async saveVCFLocally(name: string, vcf: string): Promise<void> {
		const publicDir = path.resolve(process.cwd(), "public/vcf");

		try {
			await fs.mkdir(publicDir, { recursive: true });
			await fs.writeFile(path.join(publicDir, `${name}.vcf`), vcf);
		} catch (error) {
			console.error(`Failed to save VCF locally for ${name}:`, error);
		}
	}
}
