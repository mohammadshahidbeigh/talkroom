import {Router} from "express";
import {auth} from "../middleware/auth";
import {getAvailableUsers} from "../controllers/userController";

const router = Router();

router.get("/available", auth, getAvailableUsers);

export default router;
