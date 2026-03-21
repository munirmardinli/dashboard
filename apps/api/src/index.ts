import express from "express";
import cors from "cors";
import path from "path";
import router from "./routers/index.js";
import { ReminderChecker } from "./utils/reminderChecker.js";
import "dotenv/config";

const PORT = process.env.PORT || "4012";

const reminderChecker = new ReminderChecker();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use("/", router);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	const message = err instanceof Error ? err.message : String(err);
	res.status(500).json({ error: message, statusCode: 500 });
});

app.listen(Number(PORT), () => {
	console.log(`🚀 Server on ${PORT}`);

	try {
		reminderChecker.start();
		void reminderChecker.sendTestWhatsApp();
	} catch (err) {
		console.error("❌ Failed to start reminder scheduler:", err);
	}
});
