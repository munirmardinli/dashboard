import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import createCalendar, { ICalAlarmType, type ICalEvent } from "ical-generator";
import { cwd } from "node:process";

import { CalendarBase } from "./calendarBase.js";
import { ReminderHelper } from "../../utils/reminder.js";
import { GitHubService } from "../github.js";

const github = new GitHubService();
let globalCalendarService: CalendarService | null = null;

export class CalendarService {
	private cache: Map<string, string> = new Map();

	private get _timeZone(): string {
		const tz = process.env.TZ;
		if (!tz) {
			throw new Error("TZ environment variable is not set");
		}
		return tz;
	}

	private get _icsDir(): string {
		return path.join(cwd(), "public", "ics"); // Still use public/ics for serving, but it's ignored by git
	}

	constructor() {
		this.ensureICSDirectory();
	}

	private ensureICSDirectory(): void {
		try {
			mkdirSync(this._icsDir, { recursive: true });
		} catch (error) {
			console.error("Error creating ICS directory:", error);
		}
	}

	async loadCalendarData(): Promise<Record<string, CalendarBase[]>> {
		const data: Record<string, CalendarBase[]> = {};

		try {
			const categories = await CalendarBase.getAllCategories();

			for (const category of categories) {
				try {
					const filePath = `calendar/${category}.json`;
					const { content } = await github.getFile(filePath);

					if (!content.trim()) {
						console.warn(`Empty content for ${category}, using empty array`);
						data[category] = [];
						continue;
					}

					try {
						data[category] = JSON.parse(content);
					} catch (jsonError) {
						console.error(`Invalid JSON in ${category}.json:`, jsonError);
						data[category] = [];
					}
				} catch (fileError) {
					console.warn(`Could not fetch data for ${category}:`, fileError);
					data[category] = [];
				}
			}

			return data;
		} catch (error) {
			console.error("Error loading calendar data:", error);
			return {};
		}
	}

	private async saveCalendarData(category: string, events: CalendarBase[]): Promise<void> {
		try {
			const filePath = `calendar/${category}.json`;
			await github.updateFile(filePath, JSON.stringify(events, null, 2), `Update calendar category ${category}`);
		} catch (error) {
			console.error(`Error saving calendar data for ${category}:`, error);
		}
	}

	private addReminderIfNeeded(event: ICalEvent, calendarEvent: CalendarBase) {
		const reminderOffset = ReminderHelper.getReminderOffset(calendarEvent.reminder ?? "NONE");
		if (reminderOffset > 0) {
			event.createAlarm({
				type: ICalAlarmType.audio,
				trigger: reminderOffset,
				description: `Reminder for ${calendarEvent.title}`,
				attach: "Basso",
			});
		}
	}

	private getRepeatingOptions(_event: CalendarBase): null {
		return null;
	}

	async addEvents(calendarName: string, events: CalendarBase[]): Promise<void> {
		try {
			let currentEvents: CalendarBase[] = [];
			try {
				const filePath = `calendar/${calendarName}.json`;
				const { content } = await github.getFile(filePath);

				if (!content.trim()) {
					console.warn(`Empty content for ${calendarName}, starting with empty array`);
					currentEvents = [];
				} else {
					try {
						currentEvents = JSON.parse(content);
					} catch (jsonError) {
						console.error(`Invalid JSON in ${calendarName}.json, starting with empty array:`, jsonError);
						currentEvents = [];
					}
				}
			} catch (fileError) {
				console.warn(`Could not fetch data for ${calendarName}, starting with empty array:`, fileError);
				currentEvents = [];
			}
			currentEvents.push(...events);
			await this.saveCalendarData(calendarName, currentEvents);
			this.cache.delete(calendarName);
		} catch (error) {
			console.error(`Error adding events for ${calendarName}:`, error);
		}
	}

	private saveICSFileToLocal(calendarName: string, icsContent: string): void {
		try {
			const filePath = join(this._icsDir, `${calendarName}.ics`);
			writeFileSync(filePath, icsContent, "utf-8");
		} catch (error) {
			console.error(`Error saving local ICS file for ${calendarName}:`, error);
		}
	}

	async generateICS(calendarName: string): Promise<string> {
		if (this.cache.has(calendarName)) {
			const cached = this.cache.get(calendarName);
			if (!cached) {
				throw new Error(`Cache miss for calendar: ${calendarName}`);
			}
			return cached;
		}

		try {
			const filePath = `calendar/${calendarName}.json`;
			let fileContent = "";
			try {
				const res = await github.getFile(filePath);
				fileContent = res.content;
			} catch (e) {
				console.warn(`File ${calendarName}.json fetched failed, using empty calendar`);
			}

			if (!fileContent.trim()) {
				const calendar = createCalendar({
					name: `${calendarName.charAt(0).toUpperCase() + calendarName.slice(1)}`,
					description: `Calendar for ${calendarName}`,
					timezone: this._timeZone,
				});
				const icsContent = calendar.toString();
				this.cache.set(calendarName, icsContent);
				this.saveICSFileToLocal(calendarName, icsContent);
				return icsContent;
			}

			let categoryEvents: CalendarBase[];
			try {
				categoryEvents = JSON.parse(fileContent);
			} catch (jsonError) {
				console.error(`Invalid JSON in ${calendarName}.json:`, jsonError);
				const calendar = createCalendar({
					name: `${calendarName.charAt(0).toUpperCase() + calendarName.slice(1)}`,
					description: `Calendar for ${calendarName} (JSON Error)`,
					timezone: this._timeZone,
				});
				return calendar.toString();
			}

			const calendar = createCalendar({
				name: `${calendarName.charAt(0).toUpperCase() + calendarName.slice(1)}`,
				description: `Calendar for ${calendarName}`,
				timezone: this._timeZone,
			});

			categoryEvents.forEach((event: CalendarBase) => {
				const utcStart = new Date(event.start);
				const utcEnd = new Date(event.end);

				const icalEvent = calendar.createEvent({
					summary: event.title,
					start: utcStart,
					end: utcEnd,
					description: event.description ?? null,
					location: event.location ?? null,
					priority: event.priority ?? 1,
					repeating: this.getRepeatingOptions(event) ?? null,
					timezone: this._timeZone,
				});

				this.addReminderIfNeeded(icalEvent, event);
			});
			const icsContent = calendar.toString();
			this.cache.set(calendarName, icsContent);
			this.saveICSFileToLocal(calendarName, icsContent);

			return icsContent;
		} catch (error) {
			console.error(`Error generating ICS for ${calendarName}:`, error);
			const calendar = createCalendar({
				name: `${calendarName.charAt(0).toUpperCase() + calendarName.slice(1)} Calendar`,
				description: `Calendar for ${calendarName}`,
				timezone: this._timeZone,
			});
			return calendar.toString();
		}
	}

	async getCategoryDisplayName(categoryName: string): Promise<string> {
		if (await CalendarBase.isValidCategory(categoryName)) {
			return await CalendarBase.getCategoryDisplayName(categoryName);
		}
		return categoryName;
	}

	async generateAllICS(): Promise<void> {
		const data = await this.loadCalendarData();
		for (const categoryName of Object.keys(data)) {
			await this.generateICS(categoryName);
		}
	}

	clearCache(): void {
		this.cache.clear();
	}

	static getInstance(): CalendarService {
		if (!globalCalendarService) {
			globalCalendarService = new CalendarService();
		}
		return globalCalendarService;
	}

	static resetInstance(): void {
		globalCalendarService = null;
	}
}
