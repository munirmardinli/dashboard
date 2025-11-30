import type { CalendarService } from "./calendarService.js";
import { scheduleJob } from "../../utils/scheduler.js";

export class Scheduler {
	private calendarService: CalendarService;
	private job?: globalThis.ScheduledJob;

	constructor(calendarService: CalendarService) {
		this.calendarService = calendarService;
	}

	start(): void {
		this.calendarService.generateAllICS();
		this.job = scheduleJob("*/30 * * * * *", () => {
			this.calendarService.clearCache();
			this.calendarService.generateAllICS();
		});
	}

	stop(): void {
		if (this.job) {
			this.job.cancel();
			console.log("⏹️ Scheduler stopped");
		}
	}

	updateNow(): void {
		console.log("🔄 Immediate ICS update...");
		this.calendarService.generateAllICS();
		console.log("✅ Immediate update completed");
	}
}
