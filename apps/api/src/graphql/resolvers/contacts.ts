import { GraphQLError } from "graphql";
import { GitHubService } from "../../utils/github.js";
import type { Resolvers } from "../types/types.js";
import type { ContactCardJson } from "../types/resolverJsonShapes.js";
import fs from "node:fs/promises";
import path from "node:path";

class ContactsGraphQL {
	private readonly github = new GitHubService();

	getResolvers(): Partial<Resolvers> {
		return {
			Query: {
				contacts: async () => this.listContacts(),
				contact: async (_p, args) => this.vcfForName(args.name),
			},
		} satisfies Partial<Resolvers>;
	}

	private generateVCF(contacts: ContactCardJson[]): string {
		return contacts
			.map((contact) => {
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
					"END:VCARD",
				]
					.filter((line) => !!line)
					.join("\n");
				return vcard;
			})
			.join("\n");
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

	private async listContacts() {
		const items = await this.github.listDirectory("management/contacts");
		return items
			.filter((item) => item.type === "file" && item.name.endsWith(".json"))
			.map((item) => {
				const name = item.name.replace(".json", "");
				return {
					name,
					vcfQueryHint: `contact(name: "${name}")`,
				};
			});
	}

	private async vcfForName(name: string) {
		try {
			const { content } = await this.github.getFile(`management/contacts/${name}.json`);
			const contacts = JSON.parse(content) as ContactCardJson[];
			const vcf = this.generateVCF(contacts);
			await this.saveVCFLocally(name, vcf);
			return vcf;
		} catch (e) {
			throw new GraphQLError(`VCF für ${name} konnte nicht erzeugt werden`, {
				extensions: { code: "INTERNAL_SERVER_ERROR", exception: e },
			});
		}
	}
}

export { ContactsGraphQL }
