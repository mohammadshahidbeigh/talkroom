import {Router, Request, Response} from "express";
import {
  register,
  login,
  updateUser,
  deleteUser,
} from "../controllers/authController";
import {auth} from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  await register(req, res);
});
router.post("/login", async (req: Request, res: Response) => {
  await login(req, res);
});
router.put("/update", auth, updateUser);
router.delete("/delete", auth, deleteUser);

export default router;
