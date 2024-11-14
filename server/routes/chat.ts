import {Router} from "express";
import {
  getChats,
  createChat,
  updateChat,
  deleteChat,
} from "../controllers/chatController";
import {auth} from "../middleware/auth";
import {RequestHandler} from "express";

const router = Router();

router.use(auth);

router.get("/", getChats as RequestHandler);
router.post("/", createChat as RequestHandler);
router.put("/:id", updateChat as RequestHandler);
router.delete("/:id", deleteChat as RequestHandler);

export default router;
