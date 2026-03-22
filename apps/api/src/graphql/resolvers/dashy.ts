import { GraphQLError } from "graphql";
import { GitHubService } from "../../utils/github.js";
import { assertJsonValue, type JsonValue } from "../scalars/jsonScalar.js";
import type { Resolvers } from "../types/types.js";
import type {
	DashyDocumentJson,
	DashyLinkItemJson,
	DashySectionJson,
} from "../types/resolverJsonShapes.js";

const DASHY_FILE_PATH = "management/dashy.json";

class DashyGraphQL {
	private readonly github = new GitHubService();

	getResolvers(): Partial<Resolvers> {
		return {
			Query: { dashy: async () => this.queryDashy() },
			Mutation: {
				createDashyItem: async (_p, args) => this.addItem(args.sectionId, args.item),
				updateDashyItem: async (_p, args) =>
					this.updateItem(args.sectionId, args.itemIndex, args.item),
				deleteDashyItem: async (_p, args) =>
					this.archiveItem(args.sectionId, args.itemIndex),
			},
		} satisfies Partial<Resolvers>;
	}

	private async getData(): Promise<DashyDocumentJson> {
		const { content } = await this.github.getFile(DASHY_FILE_PATH);
		return JSON.parse(content) as DashyDocumentJson;
	}

	private async save(data: DashyDocumentJson): Promise<void> {
		await this.github.updateFile(DASHY_FILE_PATH, JSON.stringify(data, null, "\t"), "Update dashy");
	}

	private async queryDashy() {
		try {
			const data = await this.getData();
			return assertJsonValue(data);
		} catch (e) {
			throw new GraphQLError("Dashy-Daten konnten nicht geladen werden", {
				extensions: { code: "INTERNAL_SERVER_ERROR", exception: e },
			});
		}
	}

	private async addItem(sectionId: string, item: JsonValue) {
		const newItem = assertJsonValue(item) as unknown as DashyLinkItemJson;
		const data = await this.getData();
		const section = data.sections.find((s) => s.id === sectionId);
		if (!section) {
			throw new GraphQLError("Section not found", { extensions: { code: "NOT_FOUND" } });
		}
		section.items.push(newItem);
		await this.save(data);
		return assertJsonValue(newItem);
	}

	private async updateItem(sectionId: string, itemIndex: number, item: JsonValue) {
		const patch = assertJsonValue(item) as unknown as Partial<DashyLinkItemJson>;
		const data = await this.getData();
		const section = data.sections.find((s: DashySectionJson) => s.id === sectionId);
		if (!section || itemIndex < 0 || !section.items[itemIndex]) {
			throw new GraphQLError("Invalid params", { extensions: { code: "BAD_USER_INPUT" } });
		}
		section.items[itemIndex] = {
			...section.items[itemIndex],
			...patch,
		} as DashyLinkItemJson;
		await this.save(data);
		return assertJsonValue(section.items[itemIndex]);
	}

	private async archiveItem(sectionId: string, itemIndex: number) {
		const data = await this.getData();
		const section = data.sections.find((s: DashySectionJson) => s.id === sectionId);
		if (!section || itemIndex < 0 || !section.items[itemIndex]) {
			throw new GraphQLError("Invalid params", { extensions: { code: "BAD_USER_INPUT" } });
		}
		section.items[itemIndex] = {
			...section.items[itemIndex],
			isArchive: true,
			updatedAt: new Date().toISOString(),
		} as DashyLinkItemJson;
		await this.save(data);
		return true;
	}
}

export { DashyGraphQL }
