import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path, { join } from "node:path";
import createCalendar, { ICalAlarmType, type ICalEvent } from "ical-generator";
import { cwd } from "node:process";

import { CalendarBase } from "./calendarBase.js";
import { ReminderHelper } from "../../utils/reminder.js";

let globalCalendarService: CalendarService | null = null;

export class CalendarService {
	private dataDir: string;
	private cache: Map<string, string> = new Map();

	private get _dataDir(): string {
		const envDataDir = process.env.NEXT_PUBLIC_CALENDAR_DATA_DIR;
		if (!envDataDir) {
			throw new Error("NEXT_PUBLIC_CALENDAR_DATA_DIR environment variable is not set");
		}
		return path.join(cwd(), envDataDir);
	}

	private get _timeZone(): string {
		const tz = process.env.TZ;
		if (!tz) {
			throw new Error("TZ environment variable is not set");
		}
		return tz;
	}

	private get _assetsDir(): string {
		const envAssetsDir = process.env.NEXT_PUBLIC_CALENDAR_ICS_DIR;
		if (!envAssetsDir) {
			throw new Error("NEXT_PUBLIC_CALENDAR_ICS_DIR environment variable is not set");
		}
		return path.join(cwd(), envAssetsDir);
	}

	constructor(dataDir?: string) {
		if (dataDir) {
			this.dataDir = dataDir;
		} else {
			this.dataDir = this._dataDir;
		}

		if (!this.dataDir || this.dataDir === "undefined") {
			this.dataDir = this._dataDir;
		}

		this.ensureAssetsDirectory();
		this.ensureDataDirectory();
	}

	private ensureAssetsDirectory(): void {
		try {
			mkdirSync(this._assetsDir, { recursive: true });
		} catch (error) {
			console.error("Error creating assets directory:", error);
		}
	}

	private ensureDataDirectory(): void {
		try {
			mkdirSync(this.dataDir, { recursive: true });
		} catch (error) {
			console.error("Error creating data directory:", error);
		}
	}

	loadCalendarData(): Record<string, CalendarBase[]> {
		const data: Record<string, CalendarBase[]> = {};

		try {
			if (!this.dataDir || this.dataDir === "undefined" || this.dataDir.includes("undefined")) {
				this.dataDir = this._dataDir;
			}

			const categories = CalendarBase.getAllCategories(this.dataDir);

			for (const category of categories) {
				try {
					if (!this.dataDir) {
						console.error(`dataDir is undefined for category: ${category}`);
						this.dataDir = this._dataDir;
					}

					const filePath = `${this.dataDir}/${category}.json`;
					const fileContent = readFileSync(filePath, "utf-8");

					if (!fileContent.trim()) {
						console.warn(`Empty file content for ${category}, using empty array`);
						data[category] = [];
						continue;
					}

					try {
						data[category] = JSON.parse(fileContent);
					} catch (jsonError) {
						console.error(`Invalid JSON in ${category}.json:`, jsonError);
						data[category] = [];
					}
				} catch (fileError) {
					console.warn(`Could not read file for ${category}:`, fileError);
					data[category] = [];
				}
			}

			return data;
		} catch (error) {
			console.error("Error loading calendar data:", error);
			return {};
		}
	}

	private saveCalendarData(category: string, events: CalendarBase[]): void {
		try {
			if (!this.dataDir || this.dataDir === "undefined" || this.dataDir.includes("undefined")) {
				this.dataDir = this._dataDir;
			}

			const filePath = `${this.dataDir}/${category}.json`;
			writeFileSync(filePath, JSON.stringify(events, null, 2), "utf-8");
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

	addEvents(calendarName: string, events: CalendarBase[]): void {
		try {
			if (!this.dataDir || this.dataDir === "undefined" || this.dataDir.includes("undefined")) {
				this.dataDir = this._dataDir;
			}

			let currentEvents: CalendarBase[] = [];
			try {
				const filePath = `${this.dataDir}/${calendarName}.json`;
				const fileContent = readFileSync(filePath, "utf-8");

				if (!fileContent.trim()) {
					console.warn(`Empty file content for ${calendarName}, starting with empty array`);
					currentEvents = [];
				} else {
					try {
						currentEvents = JSON.parse(fileContent);
					} catch (jsonError) {
						console.error(`Invalid JSON in ${calendarName}.json, starting with empty array:`, jsonError);
						currentEvents = [];
					}
				}
			} catch (fileError) {
				console.warn(`Could not read file for ${calendarName}, starting with empty array:`, fileError);
				currentEvents = [];
			}
			currentEvents.push(...events);
			this.saveCalendarData(calendarName, currentEvents);
			this.cache.delete(calendarName);
		} catch (error) {
			console.error(`Error adding events for ${calendarName}:`, error);
		}
	}

	private saveICSFile(calendarName: string, icsContent: string): void {
		try {
			const filePath = join(this._assetsDir, `${calendarName}.ics`);
			writeFileSync(filePath, icsContent, "utf-8");
		} catch (error) {
			console.error(`Error saving ICS file for ${calendarName}:`, error);
		}
	}

	generateICS(calendarName: string): string {
		if (this.cache.has(calendarName)) {
			const cached = this.cache.get(calendarName);
			if (!cached) {
				throw new Error(`Cache miss for calendar: ${calendarName}`);
			}
			return cached;
		}

		try {
			if (!this.dataDir || this.dataDir === "undefined" || this.dataDir.includes("undefined")) {
				this.dataDir = this._dataDir;
			}

			this.ensureDataDirectory();

			const filePath = `${this.dataDir}/${calendarName}.json`;

			if (!existsSync(filePath)) {
				console.warn(`File ${calendarName}.json does not exist, creating empty calendar`);
				const calendar = createCalendar({
					name: `${calendarName.charAt(0).toUpperCase() + calendarName.slice(1)}`,
					description: `Calendar for ${calendarName}`,
					timezone: this._timeZone,
				});
				const icsContent = calendar.toString();
				this.cache.set(calendarName, icsContent);
				this.saveICSFile(calendarName, icsContent);
				return icsContent;
			}

			const fileContent = readFileSync(filePath, "utf-8");

			if (!fileContent.trim()) {
				console.warn(`Empty file content for ${calendarName}, creating empty calendar`);
				const calendar = createCalendar({
					name: `${calendarName.charAt(0).toUpperCase() + calendarName.slice(1)}`,
					description: `Calendar for ${calendarName}`,
					timezone: this._timeZone,
				});
				const icsContent = calendar.toString();
				this.cache.set(calendarName, icsContent);
				this.saveICSFile(calendarName, icsContent);
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
			this.saveICSFile(calendarName, icsContent);

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

	getCategoryDisplayName(categoryName: string): string {
		if (CalendarBase.isValidCategory(categoryName)) {
			return CalendarBase.getCategoryDisplayName(categoryName);
		}
		return categoryName;
	}

	generateAllICS(): void {
		if (!this.dataDir || this.dataDir === "undefined") {
			this.dataDir = this._dataDir;
		}
		const data = this.loadCalendarData();
		Object.keys(data).forEach((categoryName) => {
			this.generateICS(categoryName);
		});
	}

	clearCache(): void {
		this.cache.clear();
	}

	static getInstance(dataDir?: string): CalendarService {
		if (!globalCalendarService) {
			globalCalendarService = new CalendarService(dataDir);
		}
		return globalCalendarService;
	}

	static resetInstance(): void {
		globalCalendarService = null;
	}
}
