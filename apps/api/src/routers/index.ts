import { Router } from "express";
import { CalendarRouter } from "./CalendarRouter.js";
import { DocsRouter } from "./DocsRouter.js";

const router = Router();

router.use(new CalendarRouter().getRouter());
router.use(new DocsRouter().getRouter());

export default router;
