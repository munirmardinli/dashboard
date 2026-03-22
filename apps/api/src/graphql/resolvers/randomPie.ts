import { GraphQLError } from "graphql";
import { GitHubService } from "../../utils/github.js";
import { assertJsonValue } from "../scalars/jsonScalar.js";
import type { Resolvers } from "../types/types.js";

class RandomPieGraphQL {
	private readonly github = new GitHubService();

	getResolvers(): Partial<Resolvers> {
		return {
			Query: { randomPie: async () => this.queryLearn() },
		} satisfies Partial<Resolvers>;
	}

	private async queryLearn() {
		try {
			const { content } = await this.github.getFile("management/learn.json");
			return assertJsonValue(JSON.parse(content));
		} catch (e) {
			throw new GraphQLError("learn.json konnte nicht geladen werden", {
				extensions: { code: "INTERNAL_SERVER_ERROR", exception: e },
			});
		}
	}
}

export { RandomPieGraphQL }
