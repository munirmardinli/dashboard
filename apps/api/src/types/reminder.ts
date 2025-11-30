/**
	* Reminder class for handling reminder offsets and labels
	*/
export class Reminder {
	reminderOffsets: Record<string, number> = {
		NONE: 0,
		MINUTES_10_BEFORE: 600,
		MINUTES_30_BEFORE: 1800,
		HOUR_1_BEFORE: 3600,
		DAY_1_BEFORE: 86400,
		WEEK_1_BEFORE: 604800,
	};

	reminderLabels: Record<string, string> = {
		MINUTES_10_BEFORE: "10 Minuten",
		MINUTES_30_BEFORE: "30 Minuten",
		HOUR_1_BEFORE: "1 Stunde",
		DAY_1_BEFORE: "1 Tag",
		WEEK_1_BEFORE: "1 Woche",
	};

	public getReminderOffset(reminder: string): number {
		return this.reminderOffsets[reminder] || 0;
	}

	public getReminderLabel(reminder: string): string {
		return this.reminderLabels[reminder] || reminder;
	}
}
