import {Request, Response} from "express";
import prisma from "../models";

// Get Messages
export const getMessages = async (req: Request, res: Response) => {
  try {
    const {chatId} = req.params;
    const messages = await prisma.message.findMany({
      where: {chatId},
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Log for debugging
    console.log(`Found ${messages.length} messages for chat ${chatId}`);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({error: "Failed to fetch messages"});
  }
};

// Send Message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const {chatId, content, type = "text"} = req.body;

    // Validate required fields
    if (!chatId || !content) {
      return res.status(400).json({error: "ChatId and content are required"});
    }

    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: req.user!.id,
        chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log for debugging
    console.log("Created message:", message);

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({error: "Failed to send message"});
  }
};

// Delete Message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    // Check if message exists and belongs to user
    const message = await prisma.message.findUnique({
      where: {id},
      select: {senderId: true},
    });

    if (!message) {
      return res.status(404).json({error: "Message not found"});
    }

    if (message.senderId !== req.user!.id) {
      return res
        .status(403)
        .json({error: "Not authorized to delete this message"});
    }

    await prisma.message.delete({
      where: {id},
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({error: "Failed to delete message"});
  }
};
