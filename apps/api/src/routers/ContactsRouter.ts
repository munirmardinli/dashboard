import { Router, type Request, type Response } from "express";
import { GitHubService } from "../utils/github.js";
import fs from "node:fs/promises";
import path from "node:path";

const github = new GitHubService();

class ContactsRouter {
	getRouter(): Router {
		const router = Router();

		router.get("/api/contacts", this.list.bind(this));
		router.get("/api/vcf/:name.vcf", this.download.bind(this));

		return router;
	}

	async list(_req: Request, res: Response): Promise<void> {
		const data = await this.getContactsList();
		res.json(data);
	}

	async download(req: Request, res: Response): Promise<void> {
		const { name = "" } = req.params;

		try {
			const vcf = await this.getVCF(name);
			res.status(200)
				.set({
					"Content-Type": "text/vcard; charset=utf-8",
					"Content-Disposition": `attachment; filename="${name}.vcf"`,
				})
				.send(vcf);
		} catch (error) {
			res.status(500).json({ error: `Failed to generate VCF for ${name}` });
		}
	}

	private async getVCF(name: string): Promise<string> {
		const { content } = await github.getFile(`management/contacts/${name}.json`);
		const contacts = JSON.parse(content) as Contact[];
		const vcf = this.generateVCF(contacts);

		await this.saveVCFLocally(name, vcf);
		return vcf;
	}

	private generateVCF(contacts: Contact[]): string {
		return contacts.map(contact => {
			const vcard = [
				"BEGIN:VCARD",
				"VERSION:3.0",
				`FN:${contact.name || ""}`,
				`TEL;TYPE=CELL:${contact.phone || ""}`,
				contact.email ? `EMAIL:${contact.email}` : "",
				contact.address ? `ADR;TYPE=HOME:;;${contact.address.replace(/\n/g, ";")}` : "",
				contact.birthday ? `BDAY:${contact.birthday}` : "",
				`REV:${contact.updatedAt || contact.createdAt || new Date().toISOString()}`,
				`UID:${contact.id}`,
				contact.isArchive ? "X-ARCHIVED:TRUE" : "",
				"END:VCARD"
			].filter(line => !!line).join("\n");
			return vcard;
		}).join("\n");
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

export { ContactsRouter }
