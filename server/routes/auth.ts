import {Router, Request, Response} from "express";
import {
  register,
  login,
  updateUser,
  deleteUser,
  updatePassword,
} from "../controllers/authController";
import {auth} from "../middleware/auth";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  register(req, res).catch((err) => {
    console.error("Register error:", err);
    res.status(500).json({error: "Registration failed"});
  });
});

router.post("/login", (req: Request, res: Response) => {
  login(req, res).catch((err) => {
    console.error("Login error:", err);
    res.status(500).json({error: "Login failed"});
  });
});

router.put("/update", auth, (req: Request, res: Response) => {
  updateUser(req, res).catch((err) => {
    console.error("Update user error:", err);
    res.status(500).json({error: "Update failed"});
  });
});

router.delete("/delete", auth, (req: Request, res: Response) => {
  deleteUser(req, res).catch((err) => {
    console.error("Delete user error:", err);
    res.status(500).json({error: "Delete failed"});
  });
});

router.put("/password", auth, (req: Request, res: Response) => {
  updatePassword(req, res).catch((err) => {
    console.error("Password update error:", err);
    res.status(500).json({error: "Password update failed"});
  });
});

export default router;
