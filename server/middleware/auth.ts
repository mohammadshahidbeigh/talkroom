import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {getUserSession} from "../services/redis";
import config from "../config/default";
import prisma from "../models";

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
      throw new Error();
    }

    const decoded = jwt.verify(token, config.jwtSecret as string) as {
      userId: string;
    };

    // Check Redis session
    const session = await getUserSession(decoded.userId);
    if (!session) {
      throw new Error("Session expired");
    }

    // Get user data including username
    const user = await prisma.user.findUnique({
      where: {id: decoded.userId},
      select: {id: true, username: true, email: true},
    });

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({error: "Please authenticate"});
  }
};
