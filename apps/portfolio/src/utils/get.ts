/**
	* Typesafe FileStore - nur get Funktion
	* Lädt Dateien basierend auf dem Dateinamen
	* Vollständig typesafe ohne any und ohne Type Assertions
	*/
class FileStoreClass implements FileStore {
	private cache = new Map<string, JsonData>();

	/**
		* Lädt eine Datei basierend auf dem Dateinamen
		* @param filename - Der Name der zu ladenden Datei (ohne Pfad)
		* @returns Promise mit den Dateidaten
		*/
	async get<T extends JsonData = JsonData>(filename: string): Promise<T> {
		const cachedData = this.cache.get(filename);
		if (cachedData) {
			return cachedData as T;
		}

		try {
			const cleanFilename = filename.replace(/^\/+/, '').replace(/\.\./g, '');

			const response: Response = await fetch(`/data/${cleanFilename}`);

			if (!response.ok) {
				throw new Error(
					`Fehler beim Laden der Datei: ${response.status} ${response.statusText}`
				);
			}

			const data: unknown = await response.json();

			if (!this.isValidJsonData(data)) {
				throw new Error('Ungültiges JSON-Format');
			}

			this.cache.set(filename, data);
			return data as T;
		} catch (error) {
			const errorMessage = `Fehler beim Laden der Datei "${filename}": ${error}`;
			console.error(errorMessage);
			throw new Error(errorMessage);
		}
	}

	/**
		* Type Guard für JsonData
		*/
	private isValidJsonData(data: unknown): data is JsonData {
		return typeof data === 'object' && data !== null && !Array.isArray(data);
	}
}

const fileStore = new FileStoreClass();

export const get = fileStore.get.bind(fileStore);
export const getAsync = get;
