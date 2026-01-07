import type { CalendarService } from "./calendarService.js";
import { scheduleJob } from "../../utils/scheduler.js";

export class Scheduler {
	private calendarService: CalendarService;
	private job?: globalThis.ScheduledJob;

	constructor(calendarService: CalendarService) {
		this.calendarService = calendarService;
	}

	async start(): Promise<void> {
		await this.calendarService.generateAllICS();
		this.job = scheduleJob("*/30 * * * * *", async () => {
			this.calendarService.clearCache();
			await this.calendarService.generateAllICS();
		});
	}

	stop(): void {
		if (this.job) {
			this.job.cancel();
			console.log("⏹️ Scheduler stopped");
		}
	}

	async updateNow(): Promise<void> {
		console.log("🔄 Immediate ICS update...");
		await this.calendarService.generateAllICS();
		console.log("✅ Immediate update completed");
	}
}
