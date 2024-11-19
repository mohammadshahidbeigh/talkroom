import {Router} from "express";
import {getMetrics} from "../controllers/metricsController";
import {auth} from "../middleware/auth";

const router = Router();

router.get("/", auth, getMetrics);

export default router;
