import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generationsRouter from "./generations";
import collectionsRouter from "./collections";
import dashboardRouter from "./dashboard";
import imagesRouter from "./images";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generationsRouter);
router.use(collectionsRouter);
router.use(dashboardRouter);
router.use(imagesRouter);

export default router;
