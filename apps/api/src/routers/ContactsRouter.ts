import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJSON, sendVCF } from "../utils/http.js";
import { ContactsService } from "./ContactsService.js";

const service = new ContactsService();

export class ContactsRouter {
	getRoutes(): Route[] {
		return [
			{ method: "GET", path: /^\/api\/contacts$/, handler: this.list.bind(this) },
			{ method: "GET", path: /^\/api\/vcf\/(?<name>[^/]+)\.vcf$/, handler: this.download.bind(this) },
		];
	}

	async list(_req: IncomingMessage, res: ServerResponse): Promise<void> {
		sendJSON(res, await service.getContactsList());
	}

	async download(_req: IncomingMessage, res: ServerResponse, ctx: RouteContext): Promise<void> {
		const params = ctx.params as unknown as { name: string };
		const name = params.name || "";
		try {
			const vcf = await service.getVCF(name);
			sendVCF(res, vcf, `${name}.vcf`);
		} catch (error) {
			sendJSON(res, { error: `Failed to generate VCF for ${name}` }, 500);
		}
	}
}
