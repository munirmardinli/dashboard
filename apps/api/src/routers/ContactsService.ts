import { GitHubService } from "./GitHubService.js";
import { generateVCF } from "../utils/vcf.js";
import fs from "node:fs/promises";
import path from "node:path";

const github = new GitHubService();

export class ContactsService {
	async getVCF(name: string): Promise<string> {
		const { content } = await github.getFile(`management/contacts/${name}.json`);
		const contacts = JSON.parse(content) as Contact[];
		const vcf = generateVCF(contacts);
		await this.saveVCFLocally(name, vcf);
		return vcf;
	}

	async getContactsList(): Promise<{ name: string; url: string }[]> {
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
