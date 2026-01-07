import { GitHubService } from "../github.js";

const github = new GitHubService();

export class CalendarBase<T = unknown> {
	[calendarName: string]: T | string | number | null | undefined | CalendarBase;

	private static _categories: string[] | null = null;
	private static _categoryDisplayNames: Record<string, string> | null = null;

	private static get _calendarDir(): string {
		return "calendar";
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

	private static async loadCategoriesFromGitHub(): Promise<string[]> {
		try {
			const items = await github.getDirectoryContents(this._calendarDir);
			return items
				.filter((item) => item.type === "file" && item.name.endsWith(".json"))
				.map((item) => item.name.replace(".json", ""));
		} catch (error) {
			console.error("Error loading categories from GitHub:", error);
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

	private static async initializeCategories(): Promise<void> {
		if (CalendarBase._categories === null) {
			CalendarBase._categories = await CalendarBase.loadCategoriesFromGitHub();
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

	static async getAllCategories(): Promise<string[]> {
		await CalendarBase.initializeCategories();
		return CalendarBase._categories || [];
	}

	static async getCategories(): Promise<Record<string, string>> {
		await CalendarBase.initializeCategories();
		return CalendarBase._categoryDisplayNames || {};
	}

	static async getCategoryKeys(): Promise<string[]> {
		await CalendarBase.initializeCategories();
		return CalendarBase._categories || [];
	}

	static async getCategoryDisplayNames(): Promise<Record<string, string>> {
		await CalendarBase.initializeCategories();
		return CalendarBase._categoryDisplayNames || {};
	}

	static async getCategoryDisplayName(category: string): Promise<string> {
		await CalendarBase.initializeCategories();
		return CalendarBase._categoryDisplayNames?.[category] || CalendarBase.generateDisplayName(category);
	}

	static async isValidCategory(category: string): Promise<boolean> {
		await CalendarBase.initializeCategories();
		return CalendarBase._categories?.includes(category) || false;
	}

	static async refreshCategories(): Promise<void> {
		CalendarBase._categories = null;
		CalendarBase._categoryDisplayNames = null;
		await CalendarBase.initializeCategories();
	}
}
