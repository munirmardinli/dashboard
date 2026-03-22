import { GraphQLError } from "graphql";
import { GitHubService } from "../../utils/github.js";
import { assertJsonValue } from "../scalars/jsonScalar.js";
import type { Resolvers } from "../types/types.js";

const PORTFOLIO_INDEX = "portfolio/index.json";

const MIME: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	webp: "image/webp",
	svg: "image/svg+xml",
};

class PortfolioGraphQL {
	private readonly github = new GitHubService();

	getResolvers(): Partial<Resolvers> {
		return {
			Query: {
				portfolio: async () => this.queryPortfolio(),
				portfolioFile: async (_p, args) => this.queryFile(args.path),
			},
		} satisfies Partial<Resolvers>;
	}

	private async queryPortfolio() {
		try {
			const { content } = await this.github.getFile(PORTFOLIO_INDEX);
			return assertJsonValue(JSON.parse(content));
		} catch (e) {
			throw new GraphQLError("Portfolio-Index konnte nicht geladen werden", {
				extensions: { code: "INTERNAL_SERVER_ERROR", exception: e },
			});
		}
	}

	private async queryFile(path: string) {
		if (!path || path.includes("..")) {
			throw new GraphQLError("Ungültiger portfolio-Pfad", {
				extensions: { code: "BAD_USER_INPUT" },
			});
		}
		const rel = path.replace(/^\/+/, "");
		try {
			const { content } = await this.github.getRawFile(`portfolio/${rel}`);
			const ext = rel.split(".").pop()?.toLowerCase() || "";
			return {
				mimeType: MIME[ext] || "application/octet-stream",
				base64: content.toString("base64"),
			};
		} catch (e) {
			throw new GraphQLError(`Portfolio-Datei nicht lesbar: ${path}`, {
				extensions: { code: "NOT_FOUND", exception: e },
			});
		}
	}
}

export { PortfolioGraphQL }
