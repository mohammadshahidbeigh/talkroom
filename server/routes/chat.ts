import { Router, Request, Response } from "express";
import {
  getChats,
  createChat,
  updateChat,
  deleteChat,
} from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = Router();

router.get("/", auth, async (req: Request, res: Response) => {
  await getChats(req, res);
});
router.post("/", auth, async (req: Request, res: Response) => {
  await createChat(req, res);
});
router.put("/:id", auth, async (req: Request, res: Response) => {
  await updateChat(req, res);
});
router.delete("/:id", auth, async (req: Request, res: Response) => {
  await deleteChat(req, res);
});

export default router;
