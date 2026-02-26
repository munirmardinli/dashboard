import { DashyRouter } from "./DashyRouter.js";
import { DataRouter } from "./DataRouter.js";
import { ConfigRouter } from "./ConfigRouter.js";
import { CalendarRouter } from "./CalendarRouter.js";
import { PortfolioRouter } from "./PortfolioRouter.js";
import { ReceiptRouter } from "./ReceiptRouter.js";
import { DocsRouter } from "./DocsRouter.js";
import { GeminiRouter } from "./GeminiRouter.js";
import { ImageRouter } from "./ImageRouter.js";
import { RandomPieRouter } from "./RandomPieRouter.js";
import { SchedulerRouter } from "./SchedulerRouter.js";

const routers = [
	new DashyRouter(),
	new DataRouter(),
	new ConfigRouter(),
	new CalendarRouter(),
	new PortfolioRouter(),
	new ReceiptRouter(),
	new DocsRouter(),
	new GeminiRouter(),
	new ImageRouter(),
	new RandomPieRouter(),
	new SchedulerRouter(),
];

export default routers;
