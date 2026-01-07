import type { CalendarService } from "../calendar/calendarService.js";
import { CalendarBase } from "../calendar/calendarBase.js";
import { sendTelegramMessage } from "../telegram/telegramService.js";
import { generateReminderContent } from "../gemini/geminiService.js";
import { ReminderHelper } from "../../utils/reminder.js";
import { scheduleJob } from "../../utils/scheduler.js";

let isCheckingReminders = false;
const globalSentReminders: Map<string, ReminderStatus> = new Map();
const globalSendingInProgress: Set<string> = new Set();

export class ReminderScheduler {
	private calendarService: CalendarService;
	private job?: ScheduledJob;

	constructor(calendarService: CalendarService) {
		this.calendarService = calendarService;
	}

	start(): void {
		this.checkReminders();
		this.job = scheduleJob("*/60 * * * * *", () => {
			this.checkReminders();
		});
	}

	stop(): void {
		if (this.job) {
			this.job.cancel();
			console.log("⏹️ Reminder Scheduler stopped");
		}
	}

	private async checkReminders(): Promise<void> {
		if (isCheckingReminders) {
			return;
		}

		isCheckingReminders = true;

		try {
			const calendarData = await this.calendarService.loadCalendarData();
			const now = new Date();
			const nowTime = now.getTime();
			const tolerance = 60 * 1000;

			for (const [category, events] of Object.entries(calendarData)) {
				for (const event of events) {
					if (!event.reminder || event.reminder === "NONE") {
						continue;
					}

					if (!event.start) {
						continue;
					}

					const reminderOffset = ReminderHelper.getReminderOffset(event.reminder);
					if (reminderOffset === 0) {
						continue;
					}

					const eventStart = new Date(event.start).getTime();
					const eventEnd = new Date(event.end).getTime();

					if (nowTime >= eventStart) {
						continue;
					}

					const reminderTime = eventStart - reminderOffset * 1000;
					const timeDiff = nowTime - reminderTime;

					if (timeDiff >= 0 && timeDiff <= tolerance) {
						const itemId = (event as { id?: string }).id || event.start || Date.now().toString();
						const eventKey = `${category}-${itemId}`;

						if (globalSentReminders.has(eventKey) || globalSendingInProgress.has(eventKey)) {
							continue;
						}

						globalSendingInProgress.add(eventKey);
						globalSentReminders.set(eventKey, {
							itemId,
							category,
							sentAt: nowTime,
							itemEnd: eventEnd,
						});

						try {
							await this.sendReminder(event, category, event.reminder);
						} catch (error) {
							console.error(`❌ Fehler beim Senden des Reminders für ${event.title}:`, error);
						} finally {
							globalSendingInProgress.delete(eventKey);
						}
					}
				}
			}

			this.cleanupOldReminders(nowTime);
		} catch (error) {
			console.error("❌ Error checking reminders:", error);
			if (error instanceof Error) {
				console.error("❌ Stack:", error.stack);
			}
		} finally {
			isCheckingReminders = false;
		}
	}

	private async sendReminder(event: CalendarBase, category: string, reminderType: string): Promise<void> {
		try {
			const eventStart = new Date(event.start);
			const eventEnd = new Date(event.end);

			const startDate = eventStart.toLocaleDateString("de-DE", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			const startTime = eventStart.toLocaleTimeString("de-DE", {
				hour: "2-digit",
				minute: "2-digit",
			});

			const endTime = eventEnd.toLocaleTimeString("de-DE", {
				hour: "2-digit",
				minute: "2-digit",
			});

			const isSameDay = eventStart.toDateString() === eventEnd.toDateString();
			const timeDisplay = isSameDay
				? `${startDate} um ${startTime} - ${endTime} Uhr`
				: `${startDate} um ${startTime} Uhr - ${eventEnd.toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })} um ${endTime} Uhr`;

			const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
			const title = `Erinnerung: ${event.title} - ${categoryName}`;

			const apiKey = process.env.GEMINI_API_KEY;

			if (!apiKey) {
				throw new Error("GEMINI_API_KEY environment variable is not set");
			}

			const content = await generateReminderContent({
				title: event.title,
				date: startDate,
				time: timeDisplay,
				location: event.location || undefined,
				description: event.description || undefined,
				reminderType: reminderType,
				category: categoryName,
				language: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE!,
				tone: "friendly",
			});

			const result = await sendTelegramMessage(title, content);

			if (!result.success) {
				console.error(`❌ Fehler beim Senden des Reminders: ${result.error}`);
			}
		} catch (error) {
			console.error(`❌ Fehler beim Senden des Reminders für ${event.title}:`, error);
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
		console.log("🔄 Immediate reminder check...");
		this.checkReminders();
		console.log("✅ Reminder check completed");
	}
}
