import {Request, Response} from "express";
import prisma from "../models";

export const getUser = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({error: "Unauthorized"});
  }

  const user = await prisma.user.findUnique({
    where: {id: req.user.id},
  });
  res.json(user);
};
