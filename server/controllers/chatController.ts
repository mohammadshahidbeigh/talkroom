import {Request, Response} from "express";
import prisma from "../models";
import {Prisma} from "@prisma/client";

export const getChats = async (req: Request, res: Response) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {participants: {some: {userId: req.user!.id}}},
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
    res.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({error: "Failed to fetch chats"});
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const {name, type, participants} = req.body;

    // Validate required fields
    if (!name || !type || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        error:
          "Invalid request body. Required fields: name, type, and participants array",
      });
    }

    // Verify all participants exist
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: participants,
        },
      },
    });

    if (users.length !== participants.length) {
      return res.status(400).json({
        error: "One or more participant IDs are invalid",
      });
    }

    const chat = await prisma.chat.create({
      data: {
        name,
        type,
        participants: {
          create: [
            {userId: req.user!.id}, // Add current user
            ...participants.map((userId: string) => ({userId})),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
    res.json(chat);
  } catch (error) {
    console.error("Create chat error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({error: "Chat already exists"});
      } else if (error.code === "P2003") {
        return res.status(400).json({error: "Invalid participant reference"});
      }
    }
    res.status(500).json({error: "Failed to create chat"});
  }
};

export const updateChat = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const {name, type} = req.body;

    // Validate required fields
    if (!name && !type) {
      return res.status(400).json({
        error:
          "Invalid request body. At least one field (name or type) is required",
      });
    }

    // Verify user has permission to update this chat
    const chatExists = await prisma.chat.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: req.user!.id,
          },
        },
      },
    });

    if (!chatExists) {
      return res.status(404).json({error: "Chat not found or access denied"});
    }

    const chat = await prisma.chat.update({
      where: {id},
      data: {
        ...(name && {name}),
        ...(type && {type}),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
    res.json(chat);
  } catch (error) {
    console.error("Update chat error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({error: "Chat not found"});
      }
    }
    res.status(500).json({error: "Failed to update chat"});
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    // Verify user has permission to delete this chat
    const chatExists = await prisma.chat.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: req.user!.id,
          },
        },
      },
    });

    if (!chatExists) {
      return res.status(404).json({error: "Chat not found or access denied"});
    }

    // Delete in transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // First delete all participants
      await tx.participant.deleteMany({
        where: {chatId: id},
      });

      // Then delete the chat
      await tx.chat.delete({
        where: {id},
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete chat error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({error: "Chat not found"});
      }
    }
    res.status(500).json({error: "Failed to delete chat"});
  }
};
