import { globalVars } from './globalyVar';

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

const inFlightGet = new Map<string, Promise<unknown>>();

let cookieJsonGetInFlight: Promise<ApiResult<unknown>> | null = null;

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

async function fetchAPI<T>(
	endpoint: string,
	options?: RequestInit
): Promise<ApiResult<T>> {
	const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	const method = (options?.method ?? "GET").toUpperCase();
	const isCookieJsonGet =
		normalizedEndpoint === "/api/cookie" && method === "GET" && !options?.body;

	const url = resolveApiUrl(endpoint);
	const canDedupe =
		(method === "GET" || method === "HEAD") && !options?.body;

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
				}
				return {
					success: false,
					error: errorMessage,
				};
			}

			const data = await response.json();
			return { success: true, data };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
			console.error(`API call failed for ${endpoint}:`, errorMessage);
			return {
				success: false,
				error: errorMessage,
			};
		}
	};

	if (isCookieJsonGet) {
		if (!cookieJsonGetInFlight) {
			cookieJsonGetInFlight = execute().finally(() => {
				cookieJsonGetInFlight = null;
			});
		}
		return cookieJsonGetInFlight as Promise<ApiResult<T>>;
	}

	if (canDedupe) {
		return dedupeGet(url, method, execute);
	}
	return execute();
}

export const CookieAPI = {
	async get(): Promise<Record<string, unknown>> {
		const result = await fetchAPI<Record<string, unknown>>(`/api/cookie`);
		return result.success ? result.data : {};
	},

	async set(updates: Record<string, unknown>): Promise<Record<string, unknown> | null> {
		const result = await fetchAPI<{ success: boolean; data: Record<string, unknown> }>(`/api/cookie`, {
			method: "POST",
			body: JSON.stringify(updates),
		});
		if (!result.success) return null;
		const body = result.data;
		if (body?.success && body.data) return body.data;
		return null;
	},
};

export const ReceiptAPI = {
	async analyzeReceipt(
		imageBase64: string
	): Promise<{ success: boolean; data?: AnalyzedData; error?: string }> {
		const result = await fetchAPI<{ success: boolean; data?: AnalyzedData; error?: string }>(
			`/api/receipt/analyze`,
			{
				method: "POST",
				body: JSON.stringify({ image: imageBase64 }),
			}
		);
		if (!result.success) return { success: false, error: result.error };
		return result.data;
	},
};

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

export const DataAPI = {
	async getItems<T extends BaseItem>(
		dataType: string,
		params?: { page?: number; limit?: number; search?: string; sortField?: string; sortOrder?: string }
	): Promise<DataApiResponse<T>> {
		const query = new URLSearchParams();
		if (params?.page) query.append("page", params.page.toString());
		if (params?.limit) query.append("limit", params.limit.toString());
		if (params?.search) query.append("search", params.search);
		if (params?.sortField) query.append("sortField", params.sortField);
		if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

		const queryString = query.toString();
		const result = await fetchAPI<DataApiResponse<T>>(`/api/data/${dataType}${queryString ? `?${queryString}` : ""}`);
		
		if (!result.success) {
			return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
		}
		return result.data;
	},

	async getItem<T extends BaseItem>(dataType: string, id: string): Promise<T | null> {
		const result = await fetchAPI<T>(`/api/data/${dataType}/findonly/${id}`);
		return result.success ? result.data : null;
	},



	async createItem<T extends BaseItem>(
		dataType: string,
		item: Partial<T>
	): Promise<T | null> {
		const result = await fetchAPI<T>(`/api/data/${dataType}`, {
			method: "POST",
			body: JSON.stringify(item),
		});
		return result.success ? result.data : null;
	},

	async updateItem<T extends BaseItem>(
		dataType: string,
		id: string,
		updates: Partial<T>
	): Promise<T | null> {
		const result = await fetchAPI<T>(`/api/data/${dataType}/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
		});
		return result.success ? result.data : null;
	},
	async archiveItem(dataType: string, id: string): Promise<boolean> {
		const result = await fetchAPI<{ message: string }>(`/api/data/${dataType}/${id}`, {
			method: "DELETE",
		});
		return result.success;
	},
};

export const PortfolioAPI = {
	async getPortfolioData(): Promise<PortfolioData | null> {
		const result = await fetchAPI<PortfolioData>(`/api/portfolio`);
		return result.success ? result.data : null;
	},
};


export const DashyAPI = {
	async getDashyData(): Promise<DashyData | null> {
		const result = await fetchAPI<DashyData>(`/api/dashy`);
		return result.success ? result.data : null;
	},

	async getAllItems(): Promise<DashyItemWithMeta[]> {
		const data = await this.getDashyData();
		if (!data) return [];

		const items: DashyItemWithMeta[] = [];
		data.sections.forEach((section) => {
			section.items.forEach((item, index) => {
				items.push({
					...item,
					id: `${section.id}-${index}`,
					sectionId: section.id,
					sectionTitle: section.title,
					itemIndex: index,
					createdAt: new Date().toISOString(),
					updatedAt: item.updatedAt || new Date().toISOString(),
					isArchive: item.isArchive || false,
				});
			});
		});
		return items;
	},

	async createItem(sectionId: string, item: DashyItem): Promise<DashyItem | null> {
		const result = await fetchAPI<DashyItem>(`/api/dashy/sections/${sectionId}/items`, {
			method: 'POST',
			body: JSON.stringify(item),
		});
		return result.success ? result.data : null;
	},

	async updateItem(sectionId: string, itemIndex: number, item: Partial<DashyItem>): Promise<DashyItem | null> {
		const result = await fetchAPI<DashyItem>(`/api/dashy/sections/${sectionId}/items/${itemIndex}`, {
			method: 'PUT',
			body: JSON.stringify(item),
		});
		return result.success ? result.data : null;
	},

	async deleteItem(sectionId: string, itemIndex: number): Promise<boolean> {
		const result = await fetchAPI<{ success: boolean }>(`/api/dashy/sections/${sectionId}/items/${itemIndex}`, {
			method: 'DELETE',
		});
		return result.success && result.data.success;
	},

};

export const LearnAPI = {
	async getRandomPieData(): Promise<RandomPieData | null> {
		const result = await fetchAPI<RandomPieData>(`/api/randomPie`);
		return result.success ? result.data : null;
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
