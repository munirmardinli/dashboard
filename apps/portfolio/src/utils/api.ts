const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4011');

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

export const PortfolioAPI = {
	async getPortfolioData(): Promise<PortfolioData | null> {
		const result = await fetchAPI<PortfolioData>(`/api/portfolio`);
		return result.success ? result.data : null;
	},
};

export const BlogAPI = {
	async getBlogData(): Promise<{ posts: BlogPost[] } | null> {
		const result = await fetchAPI<{ posts: BlogPost[] }>(`/api/blog`);
		return result.success ? result.data : null;
	},
};
