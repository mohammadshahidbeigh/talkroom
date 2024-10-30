import {Router, Request, Response} from "express";
import {
  getUser,
  updateUserProfile,
  deleteUserProfile,
  getAvailableUsers,
} from "../controllers/userController";
import {auth} from "../middleware/auth";

const router = Router();

router.get("/me", auth, getUser);
router.get("/available", auth, getAvailableUsers);
router.put("/me", auth, async (req: Request, res: Response) => {
  if (!req.is("application/json")) {
    res.status(400).json({
      error: "Content-Type must be application/json",
    });
    return;
  }
  await updateUserProfile(req, res);
});
router.delete("/me", auth, deleteUserProfile);

export default router;
