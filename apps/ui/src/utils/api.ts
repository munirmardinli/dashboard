import { globalVars } from "./globalyVar";

const inFlightGet = new Map<string, Promise<unknown>>();

function resolveApiUrl(endpoint: string): string {
	const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	return globalVars.API_URL
		? `${globalVars.API_URL.replace(/\/$/, "")}${normalizedEndpoint}`
		: normalizedEndpoint;
}

function dedupeGet<T>(url: string, method: string, run: () => Promise<T>): Promise<T> {
	const key = `${method}:${url}`;
	const existing = inFlightGet.get(key);
	if (existing !== undefined) return existing as Promise<T>;
	const p = run().finally(() => {
		inFlightGet.delete(key);
	});
	inFlightGet.set(key, p);
	return p;
}

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

async function fetchAPI<T>(
	endpoint: string,
	options?: RequestInit
): Promise<ApiResult<T>> {
	const method = (options?.method ?? "GET").toUpperCase();
	const url = resolveApiUrl(endpoint);
	const canDedupe = (method === "GET" || method === "HEAD") && !options?.body;

	const execute = async (): Promise<ApiResult<T>> => {
		try {
			const response = await fetch(url, {
				...options,
				headers: {
					"Content-Type": "application/json",
					...options?.headers,
				},
			});

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch {
					/* ignore */
				}
				return { success: false, error: errorMessage };
			}

			const data = await response.json();
			return { success: true, data };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
			console.error(`API call failed for ${endpoint}:`, errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	if (canDedupe) {
		return dedupeGet(url, method, execute);
	}
	return execute();
}

/** Relativer Pfad unter `portfolio/` für GraphQL `portfolioFile`, oder `null` wenn extern/data-URL. */
export function portfolioApiPathFromSrc(src: string): string | null {
	if (!src) return null;
	const trimmed = src.trim();
	if (
		trimmed.startsWith("http://") ||
		trimmed.startsWith("https://") ||
		trimmed.startsWith("data:")
	) {
		return null;
	}
	const m = trimmed.match(/\/api\/portfolio\/(.+)$/);
	if (m?.[1]) {
		try {
			return decodeURIComponent(m[1]);
		} catch {
			return m[1];
		}
	}
	if (trimmed.startsWith("/")) return trimmed.slice(1);
	return trimmed;
}

export const I18nStaticAPI = {
	async loadTranslations(lang: Language): Promise<Translations> {
		const path = `/i18n/${lang}.json`;
		const dedupeKey =
			typeof window !== "undefined" ? new URL(path, window.location.origin).href : path;
		return dedupeGet(dedupeKey, "GET", async () => {
			try {
				const response = await fetch(path);
				if (!response.ok) {
					throw new Error(`Failed to load translation file: ${response.statusText}`);
				}
				const translations = await response.json();
				return (translations as Translations) || ({} as Translations);
			} catch (error) {
				console.error(`Error loading translation file for ${lang}:`, error);
				return {} as Translations;
			}
		});
	},
};

export const DocsAPI = {
	async getMeta(): Promise<MetaData | null> {
		const result = await fetchAPI<MetaData>(`/api/docs/meta`);
		return result.success ? result.data : null;
	},

	async getContent(path: string): Promise<string | null> {
		const url = `${resolveApiUrl("/api/docs/content")}?p=${encodeURIComponent(path)}`;
		return dedupeGet(url, "GET", async () => {
			try {
				const response = await fetch(url);
				if (!response.ok) return null;
				return await response.text();
			} catch {
				return null;
			}
		});
	},

	async getItemMeta(path: string): Promise<MetaData | null> {
		const result = await fetchAPI<MetaData>(`/api/docs/findonly?p=${path}`);
		return result.success ? result.data : null;
	},
};
