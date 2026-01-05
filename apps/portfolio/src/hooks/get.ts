import { PortfolioAPI, BlogAPI } from "@/utils/api";

const dataCache = new Map<string, unknown>();
const loadingPromises = new Map<string, Promise<unknown>>();

/**
	* Type Guard für JsonData
	*/
function isValidJsonData(data: unknown): data is JsonData {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}

/**
	* Lädt Daten aus dem Cache oder via fetch/API
	* @param source - Die Datenquelle ('blog' oder 'portfolio')
	* @returns Promise mit den geladenen Daten
	*/
export async function getData<T = unknown>(
	source: "blog" | "portfolio"
): Promise<T> {
	if (dataCache.has(source)) {
		return dataCache.get(source) as T;
	}

	if (loadingPromises.has(source)) {
		return loadingPromises.get(source) as Promise<T>;
	}

	if (source === "portfolio") {
		const loadPromise = (async () => {
			try {
				const data = await PortfolioAPI.getPortfolioData();
				if (!data) {
					throw new Error("Portfolio-Daten konnten nicht geladen werden");
				}
				dataCache.set(source, data);
				loadingPromises.delete(source);
				return data as T;
			} catch (error) {
				loadingPromises.delete(source);
				const errorMessage = `Fehler beim Laden der Portfolio-Daten: ${error}`;
				console.error(errorMessage);
				throw new Error(errorMessage);
			}
		})();

		loadingPromises.set(source, loadPromise);
		return loadPromise;
	}

	if (source === "blog") {
		const loadPromise = (async () => {
			try {
				const data = await BlogAPI.getBlogData();
				if (!data) {
					throw new Error("Blog-Daten konnten nicht geladen werden");
				}
				dataCache.set(source, data);
				loadingPromises.delete(source);
				return data as T;
			} catch (error) {
				loadingPromises.delete(source);
				const errorMessage = `Fehler beim Laden der Blog-Daten: ${error}`;
				console.error(errorMessage);
				throw new Error(errorMessage);
			}
		})();

		loadingPromises.set(source, loadPromise);
		return loadPromise;
	}

	throw new Error(`Unbekannte Datenquelle: ${source}`);
}
