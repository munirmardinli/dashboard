import { readdirSync } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";

export class CalendarBase<T = unknown> {
	[calendarName: string]: T | string | number | null | undefined | CalendarBase;

	private static _categories: string[] | null = null;
	private static _categoryDisplayNames: Record<string, string> | null = null;
	
	private static get _dataDir(): string {
		const dataDir = process.env.NEXT_PUBLIC_CALENDAR_DATA_DIR;
		if (!dataDir) {
			throw new Error("NEXT_PUBLIC_CALENDAR_DATA_DIR environment variable is not set");
		}
		return path.join(cwd(), dataDir);
	}

	title: string;
	start: string;
	end: string;
	priority?: number | null;
	reminder?: string | null;
	description?: string | null;
	location?: string | null;

	constructor(
		title: string,
		start: string,
		end: string,
		priority?: number | null,
		reminder?: string | null,
		description?: string | null,
		location?: string | null,
	) {
		this.title = title;
		this.start = start;
		this.end = end;
		this.priority = priority;
		this.reminder = reminder;
		this.description = description;
		this.location = location;
	}

	private static loadCategoriesFromDataDir(dataDir: string = this._dataDir): string[] {
		try {
			const files = readdirSync(dataDir);
			return files
				.filter((file) => file.endsWith(".json"))
				.map((file) => file.replace(".json", ""));
		} catch (error) {
			console.error("Error loading categories from data/ directory:", error);
			return [];
		}
	}

	private static generateDisplayName(category: string): string {
		return CalendarBase.convertFileNameToDisplayName(category);
	}

	private static convertFileNameToDisplayName(fileName: string): string {
		const name = fileName.replace(/\.(json)$/i, "");
		return CalendarBase.intelligentNameConversion(name);
	}

	private static intelligentNameConversion(name: string): string {
		return name.replace(/^./, (str) => str.toUpperCase()).trim();
	}

	private static initializeCategories(dataDir: string = this._dataDir): void {
		if (CalendarBase._categories === null) {
			CalendarBase._categories = CalendarBase.loadCategoriesFromDataDir(dataDir);
		}

		if (CalendarBase._categoryDisplayNames === null) {
			CalendarBase._categoryDisplayNames = {};
			CalendarBase._categories.forEach((category) => {
				if (CalendarBase._categoryDisplayNames) {
					CalendarBase._categoryDisplayNames[category] = CalendarBase.generateDisplayName(category);
				}
			});
		}
	}

	static getAllCategories(dataDir: string = this._dataDir): string[] {
		CalendarBase.initializeCategories(dataDir);
		return CalendarBase._categories || [];
	}

	static get categories() {
		CalendarBase.initializeCategories();
		return CalendarBase._categoryDisplayNames || {};
	}

	static get categoryKeys(): string[] {
		CalendarBase.initializeCategories();
		return CalendarBase._categories || [];
	}

	static get categoryDisplayNames() {
		CalendarBase.initializeCategories();
		return CalendarBase._categoryDisplayNames || {};
	}

	static getCategoryDisplayName(category: string, dataDir: string = this._dataDir): string {
		CalendarBase.initializeCategories(dataDir);
		return CalendarBase._categoryDisplayNames?.[category] || CalendarBase.generateDisplayName(category);
	}

	static isValidCategory(category: string, dataDir: string = this._dataDir): boolean {
		CalendarBase.initializeCategories(dataDir);
		return CalendarBase._categories?.includes(category) || false;
	}

	static refreshCategories(dataDir: string = this._dataDir): void {
		CalendarBase._categories = null;
		CalendarBase._categoryDisplayNames = null;
		CalendarBase.initializeCategories(dataDir);
	}
}
