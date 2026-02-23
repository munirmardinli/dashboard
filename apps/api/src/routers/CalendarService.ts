import createCalendar from "ical-generator";
import { GitHubService } from "./GitHubService.js";

const github = new GitHubService();

export class CalendarService {
	async getICal(name: string): Promise<string> {
		const { content } = await github.getFile(`calendar/${name}.json`);
		const events = JSON.parse(content) as CalendarEvent[];
		const cal = createCalendar({ name });
		events.forEach((ev) => {
			cal.createEvent({
				summary: ev.title,
				start: new Date(ev.start),
				end: new Date(ev.end),
				description: ev.description,
				location: ev.location
			});
		});
		return cal.toString();
	}
}
