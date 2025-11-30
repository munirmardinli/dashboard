declare global {
	interface ICSAlarm {
		type: "audio" | "display" | "email";
		trigger: number;
		description?: string;
		attach?: string;
	}

	interface ICSEvent {
		summary: string;
		start: Date;
		end: Date;
		description?: string | null;
		location?: string | null;
		priority?: number | null;
		timezone: string;
		alarms?: ICSAlarm[];
	}

	interface ICSCalendar {
		name: string;
		description: string;
		timezone: string;
		events: ICSEvent[];
	}
}

export { };
