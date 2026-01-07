import { GitHubService } from "./github.js";

const github = new GitHubService();

function ensureArray<T>(value: unknown): T[] {
	return Array.isArray(value) ? (value as T[]) : [];
}

async function getConfigData() {
	const defaultLang = process.env["NEXT_PUBLIC_DEFAULT_LANGUAGE"];

	if (!defaultLang) {
		throw new Error("NEXT_PUBLIC_DEFAULT_LANGUAGE environment variable is not set");
	}

	const configPath = `${defaultLang}.json`;
	const { content } = await github.getFile(configPath);
	return JSON.parse(content);
}

export class DataService {
	async getItems<T extends GenericItem>(dataType: string): Promise<T[]> {
		const config = await getConfigData();
		const dtCfg = config.dataTypes?.[dataType];
		if (!dtCfg?.filePath) return [];

		const filePath = dtCfg.filePath;

		try {
			const { content } = await github.getFile(filePath);
			return ensureArray<T>(JSON.parse(content));
		} catch (err: unknown) {
			// If file doesn't exist, we might want to return empty array or handle error
			return [];
		}
	}

	async saveAllItems<T extends GenericItem>(dataType: string, items: T[]): Promise<boolean> {
		const config = await getConfigData();
		const dtCfg = config.dataTypes?.[dataType];
		if (!dtCfg?.filePath) return false;

		const filePath = dtCfg.filePath;
		await github.updateFile(filePath, JSON.stringify(items, null, 2), `Update ${dataType}`);
		return true;
	}

	async createItem<T extends GenericItem>(dataType: string, newItem: Partial<T>): Promise<T | null> {
		const all = await this.getItems<T>(dataType);
		const itemWithId = {
			...newItem,
			id: newItem.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
			createdAt: newItem.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			isArchive: false,
		} as unknown as T;
		const updated = [...all, itemWithId];
		const ok = await this.saveAllItems<T>(dataType, updated);
		return ok ? itemWithId : null;
	}

	async updateItem<T extends GenericItem>(
		dataType: string,
		id: string,
		updates: Partial<T>
	): Promise<T | null> {
		const all = await this.getItems<T>(dataType);
		const updatedAll = all.map((it) =>
			it.id === id ? ({ ...it, ...updates, updatedAt: new Date().toISOString() }) : it
		);
		const ok = await this.saveAllItems<T>(dataType, updatedAll);
		if (!ok) return null;
		return (updatedAll.find((i) => i.id === id) as T) || null;
	}

	async archiveItem<T extends GenericItem>(dataType: string, id: string): Promise<boolean> {
		const all = await this.getItems<T>(dataType);
		const item = all.find((it) => it.id === id);
		if (!item) {
			return false;
		}
		const updatedAll = all.map((it) =>
			it.id === id ? ({ ...it, isArchive: true, updatedAt: new Date().toISOString() }) : it
		);
		return this.saveAllItems<T>(dataType, updatedAll);
	}
}
