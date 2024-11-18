import {Router} from "express";
import {
  uploadMiddleware,
  uploadFile,
  getFile,
} from "../controllers/uploadController";
import {auth} from "../middleware/auth";

const router = Router();

router.post("/upload", auth, uploadMiddleware, uploadFile);
router.get("/uploads/:id/:filename", getFile);

export default router;
