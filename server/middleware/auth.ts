import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import prisma from "../models";
import config from "../config/default";

interface JwtPayload {
  userId: string;
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({error: "No token provided"});
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: {id: decoded.userId},
    });

    if (!user) {
      res.status(401).json({error: "User not found"});
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    const error = err instanceof Error ? err.message : "Invalid token";
    res.status(401).json({error});
  }
};
