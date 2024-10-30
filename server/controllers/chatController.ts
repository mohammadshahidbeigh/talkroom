import {Request, Response} from "express";
import prisma from "../models";

export const getChats = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({error: "Unauthorized"});
  }

  const chats = await prisma.chat.findMany({
    where: {
      participants: {
        some: {
          userId: req.user.id,
        },
      },
    },
  });
  res.json(chats);
};
