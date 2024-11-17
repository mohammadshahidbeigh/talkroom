import {Router} from "express";
import {
  createVideoRoom,
  joinVideoRoom,
  leaveVideoRoom,
  getRoomParticipants,
} from "../controllers/videoController";
import {auth} from "../middleware/auth";
import {Request, Response} from "express";

const router = Router();

// Wrap handlers to ensure they return void
const wrapHandler = (
  handler: (req: Request, res: Response) => Promise<any>
) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error("Route handler error:", error);
      res.status(500).json({error: "Internal server error"});
    }
  };
};

router.post("/", auth, wrapHandler(createVideoRoom));
router.post("/:roomId/join", auth, wrapHandler(joinVideoRoom));
router.post("/:roomId/leave", auth, wrapHandler(leaveVideoRoom));
router.get("/:roomId/participants", auth, wrapHandler(getRoomParticipants));

export default router;
