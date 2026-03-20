import { Router, type Request, type Response } from "express";
import createCalendar from "ical-generator";
import { GitHubService } from "../utils/github.js";

const github = new GitHubService();

class CalendarRouter {
	getRouter(): Router {
		const router = Router();

		router.get("/api/calendar", async (_req: Request, res: Response) =>
			res.json({ status: "ok" })
		);

		router.get("/api/ics/:calendarName.ics", this.getICS.bind(this));

		return router;
	}

	async getICS(req: Request, res: Response): Promise<void> {
		const { calendarName = "" } = req.params as CalendarRouteParams;
		try {
			const ics = await this.generateICal(calendarName);
			res.status(200)
				.set({
					"Content-Type": "text/calendar; charset=utf-8",
					"Content-Disposition": "attachment; filename=calendar.ics",
				})
				.send(ics);
		} catch (error) {
			res.status(500).json({ error: (error as Error).message });
		}
	}


	private async generateICal(name: string): Promise<string> {
		const { content } = await github.getFile(`calendar/${name}.json`);
		const events = JSON.parse(content) as CalendarEvent[];

		const cal = createCalendar({ name });
		for (const ev of events) {
			cal.createEvent({
				summary: ev.title,
				start: new Date(ev.start),
				end: new Date(ev.end),
				description: ev.description,
				location: ev.location
			});
		}
		return cal.toString();
	}
}

export { CalendarRouter }
