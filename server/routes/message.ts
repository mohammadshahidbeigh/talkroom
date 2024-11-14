import {Router} from "express";
import {
  getMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/messageController";
import {auth} from "../middleware/auth";
import {RequestHandler} from "express";

const router = Router();

// Apply auth middleware to all message routes
router.use(auth);

router.get("/:chatId", getMessages as RequestHandler);
router.post("/", sendMessage as RequestHandler);
router.delete("/:id", deleteMessage as RequestHandler);

export default router;
