import {Router} from "express";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/messageController";
import {auth} from "../middleware/auth";

const router = Router();

router.post("/", auth, sendMessage); // Send a message
router.get("/:chatId", auth, getMessages); // Get all messages for a chat
router.delete("/:id", auth, deleteMessage); // Delete a message by ID

export default router;
