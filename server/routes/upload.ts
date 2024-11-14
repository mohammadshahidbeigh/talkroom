import {Router} from "express";
import {upload, uploadFile, getFile} from "../controllers/uploadController";
import {auth} from "../middleware/auth";

const router = Router();

router.post("/", auth, upload.single("file"), uploadFile);
router.get("/uploads/:id/:filename", getFile);

export default router;
