import { DashyRouter } from "./DashyRouter.js";
import { DataRouter } from "./DataRouter.js";
import { ContactsRouter } from "./ContactsRouter.js";
import { CalendarRouter } from "./CalendarRouter.js";
import { PortfolioRouter } from "./PortfolioRouter.js";
import { ReceiptRouter } from "./ReceiptRouter.js";
import { DocsRouter } from "./DocsRouter.js";
import { ImageRouter } from "./ImageRouter.js";
import { RandomPieRouter } from "./RandomPieRouter.js";

const routers = [
	new DashyRouter(),
	new DataRouter(),
	new ContactsRouter(),
	new CalendarRouter(),
	new PortfolioRouter(),
	new ReceiptRouter(),
	new DocsRouter(),
	new ImageRouter(),
	new RandomPieRouter(),
];

export default routers;
