import { Router } from "express";
import { DashyRouter } from "./DashyRouter.js";
import { DataRouter } from "./DataRouter.js";
import { ContactsRouter } from "./ContactsRouter.js";
import { CalendarRouter } from "./CalendarRouter.js";
import { PortfolioRouter } from "./PortfolioRouter.js";
import { ReceiptRouter } from "./ReceiptRouter.js";
import { DocsRouter } from "./DocsRouter.js";
import { RandomPieRouter } from "./RandomPieRouter.js";
import { ImageRouter } from "./ImageRouter.js";
import { CookieRouter } from "./CookieRouter.js";

const router = Router();

router.use(new DashyRouter().getRouter());
router.use(new DataRouter().getRouter());
router.use(new ContactsRouter().getRouter());
router.use(new CalendarRouter().getRouter());
router.use(new PortfolioRouter().getRouter());
router.use(new ReceiptRouter().getRouter());
router.use(new DocsRouter().getRouter());
router.use(new ImageRouter().getRouter());
router.use(new RandomPieRouter().getRouter());
router.use(new CookieRouter().getRouter());

export default router;
