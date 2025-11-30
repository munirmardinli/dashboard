import { promises as fs } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";

import { scheduleJob } from "../../utils/scheduler.js";
import { sendTemplate } from "../email/emailService.js";
import { generateTodoReminderContent } from "../gemini/geminiService.js";
import { DataService } from "../data.js";
import { ReminderHelper } from "../../utils/reminder.js";

let isCheckingReminders = false;
const globalSentReminders: Map<string, ReminderStatus> = new Map();
const globalSendingInProgress: Set<string> = new Set();

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

export class TodoReminderScheduler {
	private todoTypes: string[] = [];
	private dataService: DataService;
	private job?: ScheduledJob;

	constructor() {
		this.dataService = new DataService();
	}

	start(): void {
		this.loadTodoTypes();
		this.checkReminders();
		this.job = scheduleJob("*/60 * * * * *", () => {
			this.checkReminders();
		});
	}

	stop(): void {
		if (this.job) {
			this.job.cancel();
		}
	}

	private async loadTodoTypes(): Promise<void> {
		try {
			const config = await getConfigData();
			if (!config) {
				console.error("❌ Konfiguration konnte nicht geladen werden");
				this.todoTypes = [];
				return;
			}

			const dataTypes = config.dataTypes || {};

			this.todoTypes = Object.keys(dataTypes).filter((key) =>
				key.toLowerCase().includes("todo")
			);
		} catch (error) {
			console.error("❌ Fehler beim Laden der Todo-Typen:", error);
			this.todoTypes = [];
		}
	}

	private async checkReminders(): Promise<void> {
		if (isCheckingReminders) {
			return;
		}

		isCheckingReminders = true;

		try {
			if (this.todoTypes.length === 0) {
				await this.loadTodoTypes();
			}

			const config = await getConfigData();
			if (!config) {
				console.error("❌ Konfiguration konnte nicht geladen werden");
				return;
			}

			const now = new Date();
			const nowTime = now.getTime();
			const tolerance = 5 * 60 * 1000;

			for (const todoType of this.todoTypes) {
				try {
					const todos = await this.dataService.getItems<TodoItem>(todoType);
					const todoConfig = config.dataTypes?.[todoType];

					for (const todo of todos) {
						if (todo.isArchive) {
							continue;
						}

						const todoStartStr = todo.start as string | undefined;
						const todoEndStr = todo.end as string | undefined;
						const todoReminder = todo.reminder as string | undefined;

						if (!todoStartStr || !todoEndStr) {
							continue;
						}

						if (!todoReminder || todoReminder === "NONE") {
							continue;
						}

						const reminderOffset = ReminderHelper.getReminderOffset(todoReminder);
						if (reminderOffset === 0) {
							continue;
						}

						const todoStart = new Date(todoStartStr).getTime();
						const todoEnd = new Date(todoEndStr).getTime();

						if (nowTime >= todoStart) {
							continue;
						}

						const reminderTime = todoStart - reminderOffset * 1000;
						const timeDiff = nowTime - reminderTime;

						if (timeDiff >= 0 && timeDiff <= tolerance) {
							const itemId = (todo as { id?: string }).id || todoStartStr || Date.now().toString();
							const todoKey = `${todoType}-${itemId}`;

							if (globalSentReminders.has(todoKey) || globalSendingInProgress.has(todoKey)) {
								continue;
							}

							globalSendingInProgress.add(todoKey);
							globalSentReminders.set(todoKey, {
								itemId,
								category: todoType,
								sentAt: nowTime,
								itemEnd: todoEnd,
							});

							try {
								await this.sendReminder(todo, todoReminder, todoConfig?.title || todoType);
							} catch (error) {
								const todoTitle = (todo.title as string) || "Unbekannt";
								console.error(`❌ Fehler beim Senden des Todo-Reminders für ${todoTitle}:`, error);
							} finally {
								globalSendingInProgress.delete(todoKey);
							}
						}
					}
				} catch (error) {
					console.error(`❌ Fehler beim Laden der Todos für ${todoType}:`, error);
				}
			}

			this.cleanupOldReminders(nowTime);
		} catch (error) {
			console.error("❌ Error checking todo reminders:", error);
			if (error instanceof Error) {
				console.error("❌ Stack:", error.stack);
			}
		} finally {
			isCheckingReminders = false;
		}
	}

	private async sendReminder(
		todo: Record<string, unknown>,
		reminderType: string,
		categoryName: string
	): Promise<void> {
		try {
			const reminderLabel = ReminderHelper.getReminderLabel(reminderType);
			const todoStart = new Date(todo["start"] as string);
			const todoEnd = new Date(todo["end"] as string);

			const startDate = todoStart.toLocaleDateString("de-DE", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			const startTime = todoStart.toLocaleTimeString("de-DE", {
				hour: "2-digit",
				minute: "2-digit",
			});

			const endDate = todoEnd.toLocaleDateString("de-DE", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			const endTime = todoEnd.toLocaleTimeString("de-DE", {
				hour: "2-digit",
				minute: "2-digit",
			});

			const title = `Erinnerung: ${todo["title"]} - ${categoryName}`;

			const apiKey = process.env.GEMINI_API_KEY!;
			const recipientEmail = process.env.ICLOUD_EMAIL!;

			if (!apiKey) {
				throw new Error("GEMINI_API_KEY environment variable is not set");
			}

			if (!recipientEmail) {
				throw new Error("ICLOUD_EMAIL environment variable is not set");
			}

			const content = await generateTodoReminderContent({
				title: todo["title"] as string,
				description: (todo["description"] as string) || undefined,
				startDate,
				startTime,
				endDate,
				endTime,
				reminderType: reminderType,
				category: categoryName,
				language: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE!,
				tone: "friendly",
			});

			const result = await sendTemplate(
				recipientEmail,
				title,
				content,
				{
					title,
					showSentDate: true,
				}
			);

			if (!result.success) {
				console.error(`❌ Fehler beim Senden des Todo-Reminders: ${result.error}`);
			}
		} catch (error) {
			console.error(`❌ Fehler beim Senden des Todo-Reminders für ${todo["title"]}:`, error);
		}
	}

	private cleanupOldReminders(now: number): void {
		for (const [key, status] of globalSentReminders.entries()) {
			if (now > status.itemEnd + 3600000) {
				globalSentReminders.delete(key);
			}
		}
	}

	checkNow(): void {
		this.checkReminders();
	}
}
