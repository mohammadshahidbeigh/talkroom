import {Request, Response, NextFunction} from "express";
import {incrementRequestCount} from "../services/redis";

const MAX_REQUESTS_PER_MINUTE = 100;

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";

  incrementRequestCount(typeof ip === "string" ? ip : ip[0] || "unknown-ip")
    .then((requestCount) => {
      if (requestCount > MAX_REQUESTS_PER_MINUTE) {
        res.status(429).json({error: "Too many requests"});
        return;
      }
      next();
    })
    .catch((error) => {
      next(error);
    });
};
