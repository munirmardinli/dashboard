import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class DataService {
	private async getConfig(): Promise<DashboardConfig> {
		const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de";
		const { content } = await github.getFile(`${lang}.json`);
		return JSON.parse(content) as DashboardConfig;
	}

	async getItems<T extends GenericItem>(dataType: string): Promise<T[]> {
		const config = await this.getConfig();
		const path = config.dataTypes[dataType]?.filePath;
		if (!path) return [];
		try {
			const { content } = await github.getFile(path);
			return JSON.parse(content) as T[];
		} catch { return []; }
	}

	async saveItems(dataType: string, items: unknown[]): Promise<void> {
		const config = await this.getConfig();
		const path = config.dataTypes[dataType]?.filePath;
		if (path) await github.updateFile(path, JSON.stringify(items, null, 2), `Update ${dataType}`);
	}

	async createItem<T extends GenericItem>(dataType: string, item: Partial<T>): Promise<T> {
		const items = await this.getItems<T>(dataType);
		const newItem = {
			...item,
			id: item.id || `item-${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			isArchive: false
		} as unknown as T;
		await this.saveItems(dataType, [...items, newItem]);
		return newItem;
	}

	async updateItem<T extends GenericItem>(dataType: string, id: string, updates: Partial<T>): Promise<T | undefined> {
		const items = await this.getItems<T>(dataType);
		const updated = items.map(it => it.id === id ? ({ ...it, ...updates, updatedAt: new Date().toISOString() } as unknown as T) : it);
		await this.saveItems(dataType, updated);
		return updated.find(it => it.id === id);
	}

	async archiveItem(dataType: string, id: string): Promise<unknown> {
		return this.updateItem<GenericItem>(dataType, id, { isArchive: true });
	}
}
