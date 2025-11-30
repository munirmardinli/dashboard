import { Reminder } from "../types/reminder.js";

/**
 * Globale Reminder-Instanz
 * Diese Instanz ist überall im Backend verfügbar
 */
export const ReminderHelper = new Reminder();

if (typeof global !== "undefined") {
	(global as { ReminderHelper?: Reminder }).ReminderHelper = ReminderHelper;
}
