import { GraphQLError } from "graphql";
import { GitHubService } from "../../utils/github.js";
import { assertJsonValue, type JsonValue } from "../scalars/jsonScalar.js";
import type { Resolvers } from "../types/types.js";

class CookieGraphQL {
	private readonly github = new GitHubService();
	private readonly cookiePath = "docs/cookie.json";
	private writeQueue: Promise<Record<string, unknown>> = Promise.resolve({});

	getResolvers(): Partial<Resolvers> {
		return {
			Query: { cookie: async () => assertJsonValue(await this.readCookie()) },
			Mutation: { updateCookie: async (_p, args) => this.mergeCookie(args.updates) },
		} satisfies Partial<Resolvers>;
	}

	private async readCookie(): Promise<Record<string, unknown>> {
		try {
			const { content } = await this.github.getFile(this.cookiePath);
			return JSON.parse(content) as Record<string, unknown>;
		} catch (err) {
			console.error("Failed to read cookie.json from GitHub:", err);
			return {};
		}
	}

	private async executeWrite(
		updates: Record<string, unknown>,
		retryCount = 0
	): Promise<Record<string, unknown>> {
		try {
			this.github.invalidateCacheForPath(this.cookiePath);
			let current: Record<string, unknown>;
			let sha: string | undefined;
			try {
				const file = await this.github.getFile(this.cookiePath);
				sha = file.sha;
				current = JSON.parse(file.content) as Record<string, unknown>;
			} catch {
				current = {};
			}
			const next = { ...current, ...updates };
			await this.github.updateFile(
				this.cookiePath,
				JSON.stringify(next, null, 2),
				"Update cookie.json via API",
				sha
			);
			return next;
		} catch (err: unknown) {
			if (err instanceof Error && err.message.includes("409 Conflict") && retryCount < 3) {
				console.log(`Retrying GitHub write due to 409 Conflict (attempt ${retryCount + 1})...`);
				await new Promise((r) => setTimeout(r, 1000));
				return this.executeWrite(updates, retryCount + 1);
			}
			console.error("Failed to write cookie.json to GitHub:", err);
			throw err;
		}
	}

	private async writeCookie(updates: Record<string, unknown>): Promise<Record<string, unknown>> {
		this.writeQueue = this.writeQueue
			.catch(() => ({}))
			.then(() => this.executeWrite(updates));
		return this.writeQueue;
	}

	private async mergeCookie(updates: JsonValue) {
		try {
			const u = assertJsonValue(updates) as unknown as Record<string, unknown>;
			const data = await this.writeCookie(u);
			return { success: true, data: assertJsonValue(data) };
		} catch {
			throw new GraphQLError("Failed to write cookie.json", {
				extensions: { code: "INTERNAL_SERVER_ERROR" },
			});
		}
	}
}

export { CookieGraphQL }
