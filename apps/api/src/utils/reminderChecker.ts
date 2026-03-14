import { GitHubService } from "../routers/GitHubService.js";
import { sendWhatsapp } from "./whatsapp.js";
import { ReminderHelper } from "./reminder.js";

const github = new GitHubService();

const sentReminders = new Set<string>();

export async function checkAndSendReminders() {
	try {
		console.log("🕒 Checking for upcoming reminders...");
		const files = await github.listDirectory("calendar");
		const calendarFiles = files.filter(f => f.type === "file" && f.name.endsWith(".json"));

		const now = new Date();

		for (const file of calendarFiles) {
			const { content } = await github.getFile(file.path);
			const events = JSON.parse(content) as CalendarEvent[];

			for (const event of events) {
				if (!event.reminder || event.reminder === "NONE") continue;

				const eventStart = new Date(event.start);
				const offsetSeconds = ReminderHelper.getReminderOffset(event.reminder);
				const reminderTime = new Date(eventStart.getTime() - offsetSeconds * 1000);

				const reminderId = `${event.title}-${event.start}-${event.reminder}`;

				const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

				if (reminderTime <= now && reminderTime > fiveMinutesAgo && !sentReminders.has(reminderId)) {
					const label = ReminderHelper.getReminderLabel(event.reminder);
					const message = `🔔 Reminder: "${event.title}" startet in ${label}!\n📅 ${new Date(event.start).toLocaleString("de-DE",{
						hour: "2-digit",
						minute: "2-digit"
					})}`;
					console.log(`📤 Sending WhatsApp for: ${event.title}`);
					await sendWhatsapp(message);
					sentReminders.add(reminderId);
				}
			}
		}
	} catch (error) {
		console.error("❌ Error in checkAndSendReminders:", error);
	}
}
