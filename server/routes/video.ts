import {Router, Request, Response} from "express";
import {
  createVideoRoom,
  getVideoRoom,
  endVideoRoom,
  addParticipant,
  removeParticipant,
} from "../controllers/videoController";
import {auth} from "../middleware/auth";
import {ParamsDictionary} from "express-serve-static-core";
import {ParsedQs} from "qs";

const router = Router();

// Wrap handlers to ensure they return void
const wrapHandler = (
  handler: (
    req: Request<
      ParamsDictionary,
      Record<string, unknown>,
      Record<string, unknown>,
      ParsedQs,
      Record<string, unknown>
    >,
    res: Response<Record<string, unknown>, Record<string, unknown>>
  ) => Promise<void>
) => {
  return async (
    req: Request<
      ParamsDictionary,
      Record<string, unknown>,
      Record<string, unknown>,
      ParsedQs,
      Record<string, unknown>
    >,
    res: Response<Record<string, unknown>, Record<string, unknown>>
  ): Promise<void> => {
    await handler(req, res);
  };
};

router.post(
  "/",
  auth,
  wrapHandler(async (req: Request, res: Response) => {
    await createVideoRoom(req, res);
  })
); // Create video room

router.get(
  "/:id",
  auth,
  wrapHandler(async (req: Request, res: Response) => {
    await getVideoRoom(req, res);
  })
); // Get video room details

router.put(
  "/:id/end",
  auth,
  wrapHandler(async (req: Request, res: Response) => {
    await endVideoRoom(req, res);
  })
); // End video room

router.post(
  "/:roomId/participant",
  auth,
  wrapHandler(async (req: Request, res: Response) => {
    await addParticipant(req, res);
  })
); // Add participant

router.delete(
  "/:roomId/participant/:userId",
  auth,
  wrapHandler(async (req: Request, res: Response) => {
    await removeParticipant(req, res);
  })
); // Remove participant

export default router;
