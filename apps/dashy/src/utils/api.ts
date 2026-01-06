const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4012');

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

export interface DashyWidget {
	id: string;
	title: string;
	icon: string;
	type: string;
	gridColumns: number;
	data: any;
}

export interface DashySection {
	id: string;
	title: string;
	icon: string;
	items: Array<{
		name: string;
		url: string;
		icon?: string;
		iconUrl?: string;
		isArchive?: boolean;
		updatedAt?: string;
	}>;
}

export interface DashyData {
	title: string;
	user: {
		name: string;
		greeting: string;
	};
	header: {
		searchPlaceholder: string;
		design: {
			current: string;
			options: string[];
		};
		layout: string[];
		itemSize: string[];
	};
	footer: {
		text: string;
	};
	widgets: DashyWidget[];
	sections: DashySection[];
}

export const DashyAPI = {
	async getDashyData(): Promise<DashyData | null> {
		const result = await fetchAPI<DashyData>(`/api/dashy`);
		return result.success ? result.data : null;
	},
	async createItem(sectionId: string, item: { name: string; url: string; icon?: string; iconUrl?: string }): Promise<{ name: string; url: string; icon?: string; iconUrl?: string } | null> {
		const result = await fetchAPI<{ name: string; url: string; icon?: string; iconUrl?: string }>(`/api/dashy/sections/${sectionId}/items`, {
			method: 'POST',
			body: JSON.stringify(item),
		});
		return result.success ? result.data : null;
	},
	async updateItem(sectionId: string, itemIndex: number, item: { name: string; url: string; icon?: string; iconUrl?: string }): Promise<{ name: string; url: string; icon?: string; iconUrl?: string } | null> {
		const result = await fetchAPI<{ name: string; url: string; icon?: string; iconUrl?: string }>(`/api/dashy/sections/${sectionId}/items/${itemIndex}`, {
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
