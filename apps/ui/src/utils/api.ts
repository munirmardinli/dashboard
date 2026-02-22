import { API_URL } from "@/utils/env";

async function fetchAPI<T>(
	endpoint: string,
	options?: RequestInit
): Promise<{ success: true; data: T } | { success: false; error: string }> {
	try {

		const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
		const url = API_URL
			? `${API_URL.replace(/\/$/, '')}${normalizedEndpoint}`
			: normalizedEndpoint;

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
}

export const DataAPI = {
	async getItems<T extends BaseItem>(dataType: string): Promise<T[]> {
		const result = await fetchAPI<T[]>(`/api/data/${dataType}`);
		return result.success ? result.data : [];
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


export const ConfigAPI = {
	async getTranslations(language: string): Promise<Record<string, unknown>> {
		const result = await fetchAPI<Record<string, unknown>>(`/api/config/translations/${language}`);
		return result.success ? result.data : {};
	},

	async getFullConfig(): Promise<BasicConfig> {
		const result = await fetchAPI<BasicConfig>(`/api/config`);
		return result.success ? result.data : ({} as BasicConfig);
	},

	async getDataTypeConfig(dataType: string): Promise<DataTypeConfig | null> {
		const result = await fetchAPI<DataTypeConfig>(`/api/config/dataType/${dataType}`);
		return result.success ? result.data : null;
	},

	async getNavigationConfig(): Promise<NavigationConfig | null> {
		const result = await fetchAPI<NavigationConfig>(`/api/config/navigation`);
		return result.success ? result.data : null;
	},

	async getOnboardingConfig(): Promise<OnboardingFeature[]> {
		const result = await fetchAPI<OnboardingFeature[]>(`/api/config/onboarding`);
		return result.success ? result.data : [];
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
		try {
			const response = await fetch(`${API_URL}/api/docs/content?p=${path}`);
			if (!response.ok) return null;
			return await response.text();
		} catch {
			return null;
		}
	},
};
