import { GitHubService } from "./github.js";
import { sendWhatsapp } from "./whatsapp.js";

class ReminderChecker {
	private github = new GitHubService();
	private sentReminders = new Set<string>();
	private job: globalThis.ScheduledJob | null = null;

	private reminderOffsets: Record<string, number> = {
		NONE: 0,
		MINUTES_10_BEFORE: 600,
		MINUTES_30_BEFORE: 1800,
		HOUR_1_BEFORE: 3600,
		DAY_1_BEFORE: 86400,
		WEEK_1_BEFORE: 604800,
	};

	private reminderLabels: Record<string, string> = {
		MINUTES_10_BEFORE: "10 Minuten",
		MINUTES_30_BEFORE: "30 Minuten",
		HOUR_1_BEFORE: "1 Stunde",
		DAY_1_BEFORE: "1 Tag",
		WEEK_1_BEFORE: "1 Woche",
	};

	/**
		* Startet den periodischen Reminder-Check.
		* @param cronExpression z. B. alle 60 s: Stern-Slash-60 und fuenf Sterne (6 Felder).
		*/
	start(cronExpression = process.env.REMINDER_CRON || "*/60 * * * * *"): void {
		this.stop();
		this.job = this.scheduleIntervalJob(cronExpression, () => {
			void this.checkAndSendReminders();
		});
	}

	stop(): void {
		if (this.job) {
			this.job.cancel();
			this.job = null;
			console.log("⏹️ ReminderChecker gestoppt");
		}
	}

	async checkAndSendReminders(): Promise<void> {
		try {
			const files = await this.github.listDirectory("calendar");
			const calendarFiles = files.filter(
				(f) => f.type === "file" && f.name.endsWith(".json")
			);

			const now = new Date();
			const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
			for (const file of calendarFiles) {
				const { content } = await this.github.getFile(file.path);
				const events = JSON.parse(content) as CalendarEvent[];

				for (const event of events) {
					if (!event.reminder || event.reminder === "NONE") continue;
					const eventStart = new Date(event.start);
					const offsetSeconds = this.getReminderOffset(event.reminder);
					const reminderTime = new Date(
						eventStart.getTime() - offsetSeconds * 1000
					);
					const reminderId = `${event.title}-${event.start}-${event.reminder}`;

					if (
						reminderTime <= now &&
						reminderTime > fiveMinutesAgo &&
						!this.sentReminders.has(reminderId)
					) {
						const label = this.getReminderLabel(event.reminder);
						const message =
							`🔔 Reminder: "${event.title}" startet in ${label}!\n` +
							`📅 ${new Date(event.start).toLocaleString("de-DE", {
								hour: "2-digit",
								minute: "2-digit",
							})}`;
						console.log(`📤 Sending WhatsApp for: ${event.title}`);
						await sendWhatsapp(message);
						this.sentReminders.add(reminderId);
					}
				}
			}
		} catch (error) {
			console.error("❌ Error in checkAndSendReminders:", error);
		}
	}

	private getReminderOffset(reminder: string): number {
		return this.reminderOffsets[reminder] || 0;
	}

	private getReminderLabel(reminder: string): string {
		return this.reminderLabels[reminder] || reminder;
	}

	private parseCronExpression(cronExpression: string): number | null {
		const parts = cronExpression.trim().split(/\s+/);
		if (parts.length !== 6) {
			return null;
		}
		const secondsPart = parts[0];
		if (secondsPart && secondsPart.startsWith("*/")) {
			const interval = parseInt(secondsPart.substring(2), 10);
			if (!isNaN(interval) && interval > 0) {
				if (parts.slice(1).every((part) => part === "*")) {
					return interval * 1000;
				}
			}
		}
		return null;
	}

	private scheduleIntervalJob(
		cronExpression: string,
		callback: () => void
	): globalThis.ScheduledJob {
		const intervalMs = this.parseCronExpression(cronExpression);

		if (!intervalMs) {
			throw new Error(
				`Unsupported cron expression: ${cronExpression}. Only simple second intervals are supported (e.g. ${"*/30 * * * * *"}).`
			);
		}

		let intervalId: NodeJS.Timeout | null = null;
		let isCancelled = false;

		const job: globalThis.ScheduledJob = {
			cancel() {
				if (intervalId !== null) {
					clearInterval(intervalId);
					intervalId = null;
					isCancelled = true;
				}
			},
		};

		callback();
		intervalId = setInterval(() => {
			if (!isCancelled) {
				callback();
			}
		}, intervalMs);

		return job;
	}
}

export { ReminderChecker };
