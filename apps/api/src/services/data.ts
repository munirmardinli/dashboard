import { promises as fs } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";

function ensureArray<T>(value: unknown): T[] {
	return Array.isArray(value) ? (value as T[]) : [];
}

async function getConfigData() {
	const projectRoot = cwd();
	const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
	const defaultLang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE;
	
	if (!assetsDir) {
		throw new Error("NEXT_PUBLIC_ASSETS_DIR environment variable is not set");
	}
	
	if (!defaultLang) {
		throw new Error("NEXT_PUBLIC_DEFAULT_LANGUAGE environment variable is not set");
	}
	
	const configPath = path.join(projectRoot, assetsDir, `${defaultLang}.json`);
	const configData = await fs.readFile(configPath, "utf8");
	return JSON.parse(configData);
}

export class DataService {
	async getItems<T extends GenericItem>(dataType: string): Promise<T[]> {
		const projectRoot = cwd();
		const config = await getConfigData();
		const dtCfg = config.dataTypes?.[dataType];
		if (!dtCfg?.filePath) return [];

		const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
		if (!assetsDir) {
			throw new Error("NEXT_PUBLIC_ASSETS_DIR environment variable is not set");
		}
		const filePath = path.join(projectRoot, assetsDir, dtCfg.filePath);

		try {
			const fileData = await fs.readFile(filePath, "utf8");
			return ensureArray<T>(JSON.parse(fileData));
		} catch (err: unknown) {
			const anyErr = err as NodeJS.ErrnoException;
			if (anyErr?.code === "ENOENT") {
				await fs.mkdir(path.dirname(filePath), { recursive: true });
				await fs.writeFile(filePath, JSON.stringify([], null, 2));
				return [];
			}
			throw err;
		}
	}

	async saveAllItems<T extends GenericItem>(dataType: string, items: T[]): Promise<boolean> {
		const projectRoot = cwd();
		const config = await getConfigData();
		const dtCfg = config.dataTypes?.[dataType];
		if (!dtCfg?.filePath) return false;

		const assetsDir = process.env.NEXT_PUBLIC_ASSETS_DIR;
		if (!assetsDir) {
			throw new Error("NEXT_PUBLIC_ASSETS_DIR environment variable is not set");
		}
		const filePath = path.join(projectRoot, assetsDir, dtCfg.filePath);
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, JSON.stringify(items, null, 2));
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
