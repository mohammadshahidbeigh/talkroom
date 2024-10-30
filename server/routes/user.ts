import {Router} from "express";
import {getUser} from "../controllers/userController";
import {auth} from "../middleware/auth";
import {RequestHandler} from "express";

const router = Router();

router.get("/me", auth as RequestHandler, getUser as RequestHandler);

export default router;
