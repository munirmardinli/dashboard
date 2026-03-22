import { randomUUID } from "node:crypto";
import { GraphQLError } from "graphql";
import { GitHubService } from "../../utils/github.js";
import { assertJsonValue, type JsonValue } from "../scalars/jsonScalar.js";
import type {
	MutationCreateDataArgs,
	MutationDeleteDataArgs,
	MutationUpdateDataArgs,
	QueryDataArgs,
	QueryDatasArgs,
	Resolvers,
} from "../types/types.js";
import type { DataListRow, LangJsonConfig } from "../types/resolverJsonShapes.js";

type ResolveConfigResult =
	| { ok: true; config: LangJsonConfig }
	| { ok: false; error: string };

export class DataGraphQL {
	private readonly github = new GitHubService();

	getResolvers(): Partial<Resolvers> {
		return {
			Query: {
				datas: async (_p, args) => this.queryDatas(args),
				data: async (_p, args) => this.queryData(args),
			},
			Mutation: {
				createData: async (_p, args) => this.mutateCreateItem(args),
				updateData: async (_p, args) => this.mutateUpdateItem(args),
				deleteData: async (_p, args) => this.mutateDeleteItem(args),
			},
		} satisfies Partial<Resolvers>;
	}

	private async resolveConfig(): Promise<ResolveConfigResult> {
		const token = process.env.GITHUB_TOKEN?.trim() ?? "";
		const owner = process.env.GITHUB_OWNER?.trim() ?? "";
		const repo = process.env.GITHUB_REPO?.trim() ?? "";
		if (!token || !owner || !repo) {
			return { ok: false, error: ".env file is not configured correctly" };
		}
		const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de";
		try {
			const { content } = await this.github.getFile(`${lang}.json`);
			return { ok: true, config: JSON.parse(content) as LangJsonConfig };
		} catch (e) {
			const branch = process.env.GITHUB_BRANCH?.trim() || "main";
			const raw = e instanceof Error ? e.message : String(e);
			console.error("❌ DataGraphQL: Konfiguration (GitHub) nicht ladbar:", e);
			if (raw.includes("404") || raw.toLowerCase().includes("not found")) {
				return {
					ok: false,
					error: `GitHub: ${lang}.json not found on branch "${branch}" (404).`,
				};
			}
			if (raw.includes("403")) {
				return {
					ok: false,
					error: "GitHub: 403 — Token braucht repo-Zugriff oder Repo/Owner stimmt nicht.",
				};
			}
			if (raw.includes("ENOTFOUND") || raw.includes("fetch failed")) {
				return {
					ok: false,
					error:
						"Netzwerk: api.github.com vom Server nicht erreichbar (DNS/Firewall, z. B. Synology).",
				};
			}
			return { ok: false, error: `GitHub: ${raw} (Branch ref=${branch}).` };
		}
	}

	private async getConfig(): Promise<LangJsonConfig | null> {
		const r = await this.resolveConfig();
		return r.ok ? r.config : null;
	}

	private async getItemsWithConfig<T extends DataListRow>(
		config: LangJsonConfig,
		dataType: string
	): Promise<T[]> {
		const path = config.dataTypes[dataType]?.filePath;
		if (!path) return [];
		try {
			const { content } = await this.github.getFile(path);
			return JSON.parse(content) as T[];
		} catch {
			return [];
		}
	}

	private async getItems<T extends DataListRow>(dataType: string): Promise<T[]> {
		const config = await this.getConfig();
		if (!config) return [];
		return this.getItemsWithConfig<T>(config, dataType);
	}

	private async saveItems(dataType: string, items: DataListRow[]): Promise<void> {
		const resolved = await this.resolveConfig();
		if (!resolved.ok) {
			throw new GraphQLError(resolved.error, {
				extensions: { code: "SERVICE_UNAVAILABLE" },
			});
		}
		const path = resolved.config.dataTypes[dataType]?.filePath;
		if (path) {
			await this.github.updateFile(path, JSON.stringify(items, null, 2), `Update ${dataType}`);
		}
	}

	private async queryDatas(args: QueryDatasArgs) {
		const dataType = args.dataType;
		const pag = args.pagination;
		const p = pag?.page ?? 1;
		const l = pag?.limit ?? 10;
		const search = args.search ?? "";
		const sortField = args.sort?.field ?? "";
		const sortOrder = args.sort?.order === "desc" ? "desc" : "asc";
		const offset = (p - 1) * l;

		const resolved = await this.resolveConfig();
		if (!resolved.ok) {
			return {
				items: [] as JsonValue[],
				total: 0,
				page: p,
				limit: l,
				totalPages: 0,
				unavailableReason: resolved.error,
			};
		}
		const config = resolved.config;

		let items = (await this.getItemsWithConfig<DataListRow>(config, dataType)).filter(
			(item) => !item.isArchive
		);

		if (search) {
			const term = search.toLowerCase();
			items = items.filter((item) =>
				Object.values(item).some((val) => String(val).toLowerCase().includes(term))
			);
		}

		if (sortField) {
			items.sort((a: DataListRow, b: DataListRow) => {
				const valA = (a as Record<string, unknown>)[sortField];
				const valB = (b as Record<string, unknown>)[sortField];
				if (valA === valB) return 0;
				if (valA === undefined || valA === null) return 1;
				if (valB === undefined || valB === null) return -1;
				const comparison = String(valA).localeCompare(String(valB), undefined, {
					numeric: true,
					sensitivity: "base",
				});
				return sortOrder === "desc" ? -comparison : comparison;
			});
		}

		const total = items.length;
		const paginated = items.slice(offset, offset + l);

		return {
			items: paginated.map((item) => assertJsonValue(item)),
			total,
			page: p,
			limit: l,
			totalPages: Math.ceil(total / l) || 0,
			unavailableReason: null as string | null,
		};
	}

	private async queryData(args: QueryDataArgs) {
		const resolved = await this.resolveConfig();
		if (!resolved.ok) {
			throw new GraphQLError(resolved.error, {
				extensions: { code: "SERVICE_UNAVAILABLE" },
			});
		}
		const items = await this.getItemsWithConfig<DataListRow>(resolved.config, args.dataType);
		const item = items.find((it) => it.id === args.id);
		if (!item) {
			throw new GraphQLError("Item not found", { extensions: { code: "NOT_FOUND" } });
		}
		return assertJsonValue(item);
	}

	private async mutateCreateItem(args: MutationCreateDataArgs) {
		try {
			const raw = assertJsonValue(args.item);
			if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
				throw new GraphQLError("item muss ein JSON-Objekt sein", {
					extensions: { code: "BAD_USER_INPUT" },
				});
			}
			const item = raw as unknown as Partial<DataListRow>;
			const items = await this.getItems<DataListRow>(args.dataType);
			const newItem = {
				...item,
				id: item.id || randomUUID(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				isArchive: false,
			} as DataListRow;
			await this.saveItems(args.dataType, [...items, newItem]);
			return assertJsonValue(newItem);
		} catch (e) {
			if (e instanceof GraphQLError) throw e;
			throw new GraphQLError("Fehler beim Anlegen des Eintrags", {
				extensions: { code: "INTERNAL_SERVER_ERROR", exception: e },
			});
		}
	}

	private async mutateUpdateItem(args: MutationUpdateDataArgs) {
		try {
			const updates = assertJsonValue(args.updates) as unknown as Partial<DataListRow>;
			const items = await this.getItems<DataListRow>(args.dataType);
			const updated = items.map((it) =>
				it.id === args.id
					? { ...it, ...updates, updatedAt: new Date().toISOString() }
					: it
			) as DataListRow[];
			await this.saveItems(args.dataType, updated);
			const found = updated.find((it) => it.id === args.id);
			return found ? assertJsonValue(found) : null;
		} catch (e) {
			if (e instanceof GraphQLError) throw e;
			throw new GraphQLError("Fehler beim Aktualisieren des Eintrags", {
				extensions: { code: "INTERNAL_SERVER_ERROR", exception: e },
			});
		}
	}

	private async mutateDeleteItem(args: MutationDeleteDataArgs) {
		await this.mutateUpdateItem({
			dataType: args.dataType,
			id: args.id,
			updates: { isArchive: true },
		});
		return true;
	}
}
