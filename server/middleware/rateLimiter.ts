import {Request, Response, NextFunction} from "express";
import {incrementRequestCount} from "../services/redis";

export const MAX_REQUESTS_PER_MINUTE = {
  default: 100,
  auth: 20, // Stricter limit for auth routes
  upload: 10, // Stricter limit for file uploads
} as const;

export const rateLimiter =
  (limit: number = MAX_REQUESTS_PER_MINUTE.default) =>
  (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
    const path = req.path;

    incrementRequestCount(`${typeof ip === "string" ? ip : ip[0]}:${path}`)
      .then((requestCount) => {
        if (requestCount > limit) {
          res.status(429).json({
            error: "Too many requests",
            retryAfter: 60, // seconds
          });
          return;
        }
        next();
      })
      .catch(next);
  };
