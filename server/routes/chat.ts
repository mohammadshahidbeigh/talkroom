import {Router} from "express";
import {getChats} from "../controllers/chatController";
import {auth} from "../middleware/auth";
import {RequestHandler} from "express";

const router = Router();

router.get("/", auth as RequestHandler, getChats as RequestHandler);

export default router;
