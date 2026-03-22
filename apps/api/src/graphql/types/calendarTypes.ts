/** Kalender-JSON aus `calendar/*.json` (ICS + ReminderChecker). */
export interface CalendarEvent {
	title: string;
	start: string;
	end: string;
	description?: string;
	location?: string;
	reminder?: string;
}

export interface CalendarRouteParams {
	calendarName?: string;
}

/** Periodischer Job (früher `globalThis.ScheduledJob` aus api.ts). */
export interface ScheduledJob {
	cancel(): void;
}
