import {Request, Response} from "express";
import prisma from "../models";

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  const {chatId, content, type = "text"} = req.body;

  const message = await prisma.message.create({
    data: {
      content,
      type,
      senderId: req.user!.id,
      chatId,
    },
  });

  res.json(message);
};

// Get messages for a specific chat
export const getMessages = async (req: Request, res: Response) => {
  const {chatId} = req.params;

  const messages = await prisma.message.findMany({
    where: {chatId},
    orderBy: {createdAt: "asc"},
  });

  res.json(messages);
};

// Delete a message
export const deleteMessage = async (req: Request, res: Response) => {
  const {id} = req.params;

  await prisma.message.delete({
    where: {id},
  });

  res.status(204).send();
};
