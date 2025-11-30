/**
	* API Client für Backend-Kommunikation
	*/

// In Production: Wenn NEXT_PUBLIC_API_URL leer ist, verwende relative Pfade (werden über Nginx proxied)
// In Dev: Verwende localhost:4011 oder die gesetzte URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4011');

// GenericItem ist ein globaler Type aus globals.d.ts (BaseItem)

async function fetchAPI<T>(
	endpoint: string,
	options?: RequestInit
): Promise<{ success: true; data: T } | { success: false; error: string }> {
	try {
		// Stelle sicher, dass endpoint mit / beginnt
		const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

		// Wenn API_URL leer ist (Production mit Nginx Proxy), verwende relative URL
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

/**
	* CRUD-Operationen für Daten
	*/
export const DataAPI = {
	/**
		* Alle Items eines Datentyps abrufen
		*/
	async getItems<T extends BaseItem>(dataType: string): Promise<T[]> {
		const result = await fetchAPI<T[]>(`/api/data/${dataType}`);
		return result.success ? result.data : [];
	},

	/**
		* Ein neues Item erstellen
		*/
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

	/**
		* Ein Item aktualisieren
		*/
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

	/**
		* Ein Item archivieren (soft delete)
		*/
	async archiveItem(dataType: string, id: string): Promise<boolean> {
		const result = await fetchAPI<{ message: string }>(`/api/data/${dataType}/${id}`, {
			method: "DELETE",
		});
		return result.success;
	},
};

/**
	* Config-Operationen
	*/
export const ConfigAPI = {
	/**
		* Übersetzungen abrufen
		*/
	async getTranslations(language: string): Promise<Record<string, unknown>> {
		const result = await fetchAPI<Record<string, unknown>>(`/api/config/translations/${language}`);
		return result.success ? result.data : {};
	},

	/**
		* Vollständige Konfiguration abrufen
		*/
	async getFullConfig(): Promise<BasicConfig> {
		const result = await fetchAPI<BasicConfig>(`/api/config`);
		return result.success ? result.data : ({} as BasicConfig);
	},

	/**
		* DataType-Konfiguration abrufen
		*/
	async getDataTypeConfig(dataType: string): Promise<DataTypeConfig | null> {
		const result = await fetchAPI<DataTypeConfig>(`/api/config/dataType/${dataType}`);
		return result.success ? result.data : null;
	},

	/**
		* Navigation-Konfiguration abrufen
		*/
	async getNavigationConfig(): Promise<NavigationConfig | null> {
		const result = await fetchAPI<NavigationConfig>(`/api/config/navigation`);
		return result.success ? result.data : null;
	},
};

/**
	* Docs-Operationen
	*/
export const DocsAPI = {
	async getAllDocs(): Promise<DocItem[]> {
		const result = await fetchAPI<DocItem[]>(`/api/docs`);
		return result.success ? result.data : [];
	},

	async createDoc(doc: Partial<DocItem>): Promise<DocItem | null> {
		const result = await fetchAPI<DocItem>(`/api/docs`, {
			method: "POST",
			body: JSON.stringify(doc),
		});
		return result.success ? result.data : null;
	},

	async updateDoc(id: string, updates: Partial<DocItem>): Promise<DocItem | null> {
		const result = await fetchAPI<DocItem>(`/api/docs/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
		});
		return result.success ? result.data : null;
	},

	async archiveDoc(id: string): Promise<boolean> {
		const result = await fetchAPI<{ message: string }>(`/api/docs/${id}`, {
			method: "DELETE",
		});
		return result.success;
	},
};
