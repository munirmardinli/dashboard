import type { CookieQuery } from "@/models/graphql";
import type { JsonValue } from "@/types/jsonScalar";
import apolloClient from "./apolloClient";
import { GET_COOKIE, UPDATE_COOKIE } from "./queries";

let cookieCache: Record<string, unknown> | null = null;
let cookiePromise: Promise<Record<string, unknown>> | null = null;

function normalizeCookie(raw: unknown): Record<string, unknown> | null {
	if (raw !== null && raw !== undefined && typeof raw === "object" && !Array.isArray(raw)) {
		return raw as Record<string, unknown>;
	}
	return null;
}

function writeCookieCacheToApollo(cache: Record<string, unknown>) {
	try {
		apolloClient.cache.writeQuery<CookieQuery>({
			query: GET_COOKIE,
			data: { cookie: cache as JsonValue },
		});
	} catch {
	}
}

export const cookieService = {
	async get(): Promise<Record<string, unknown>> {
		if (cookieCache) return cookieCache;
		if (cookiePromise) return cookiePromise;

		cookiePromise = (async () => {
			try {
				const snap = apolloClient.cache.readQuery<CookieQuery>({ query: GET_COOKIE });
				const fromCache = normalizeCookie(snap?.cookie);
				if (fromCache) {
					cookieCache = fromCache;
					return fromCache;
				}
			} catch {
			}

			const { data, error } = await apolloClient.query<CookieQuery>({
				query: GET_COOKIE,
				fetchPolicy: "cache-first",
			});
			if (error) throw error;
			const next = normalizeCookie(data?.cookie) ?? {};
			cookieCache = next;
			return next;
		})()
			.catch((err) => {
				console.error("cookieService: Failed to fetch cookie", err);
				cookieCache = {};
				return {};
			})
			.finally(() => {
				cookiePromise = null;
			});

		return cookiePromise;
	},

	async set(updates: Record<string, unknown>): Promise<void> {
		if (cookieCache) {
			cookieCache = { ...cookieCache, ...updates };
		}

		try {
			const { data, errors } = await apolloClient.mutate({
				mutation: UPDATE_COOKIE,
				variables: { updates: updates as JsonValue },
			});
			if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "));
			const body = data?.updateCookie;
			if (body?.success && body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
				cookieCache = body.data as Record<string, unknown>;
				writeCookieCacheToApollo(cookieCache);
			}
		} catch (err) {
			console.error("cookieService: Failed to save cookie", err);
		}
	},

	invalidate() {
		cookieCache = null;
		try {
			apolloClient.cache.evict({ id: "ROOT_QUERY", fieldName: "cookie" });
			apolloClient.cache.gc();
		} catch {
			/* ignore */
		}
	},
};
