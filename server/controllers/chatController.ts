import {Request, Response} from "express";
import prisma from "../models";
import {Prisma, Participant} from "@prisma/client";
import {PrismaClient} from "@prisma/client";

export const getChats = async (req: Request, res: Response) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: req.user!.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get only the last message
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({error: "Failed to fetch chats"});
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const {name, type, participants} = req.body;

    // Check if required fields are present
    if (!type || !participants || !participants.length) {
      return res.status(400).json({
        error:
          "Invalid request body. Required fields: name, type, and participants array",
      });
    }

    // Check for existing chat
    const existingChat = await prisma.chat.findFirst({
      where: {
        type,
        AND: [
          // All specified participants must be in the chat
          ...participants.map((participantId: string) => ({
            participants: {
              some: {
                userId: participantId,
              },
            },
          })),
          // Current user must be in the chat
          {
            participants: {
              some: {
                userId: req.user!.id,
              },
            },
          },
        ],
        // For direct chats, ensure exactly 2 participants
        ...(type === "direct"
          ? {
              participants: {
                every: {
                  userId: {
                    in: [...participants, req.user!.id],
                  },
                },
              },
            }
          : {}),
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (existingChat) {
      return res.status(400).json({
        error:
          type === "direct"
            ? "A chat with this user already exists"
            : "A group with these participants already exists",
        existingChat: {
          id: existingChat.id,
          name: existingChat.name || "",
          type: existingChat.type,
          participants: existingChat.participants.map(
            (p: Participant) => p.userId
          ),
        },
      });
    }

    // Create new chat if it doesn't exist
    const chat = await prisma.chat.create({
      data: {
        name: type === "direct" ? "" : name,
        type,
        participants: {
          create: [
            {userId: req.user!.id},
            ...participants.map((participantId: string) => ({
              userId: participantId,
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    // Emit socket event for real-time updates
    req.io?.emit("chat-created", chat);

    res.json(chat);
  } catch (error) {
    console.error("Create chat error:", error);
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

    // Check if chat exists and user is a participant
    const chat = await prisma.chat.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: req.user!.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      return res.status(404).json({error: "Chat not found"});
    }

    // Get user info before deleting
    const user = await prisma.user.findUnique({
      where: {id: req.user!.id},
      select: {username: true},
    });

    // Delete participant
    await prisma.participant.deleteMany({
      where: {
        AND: [{chatId: id}, {userId: req.user!.id}],
      },
    });

    // If this was the last participant, delete the entire chat
    if (chat.participants.length <= 1) {
      await prisma.$transaction(
        async (
          tx: Omit<
            PrismaClient,
            "$connect" | "$disconnect" | "$on" | "$transaction" | "$use"
          >
        ) => {
          await tx.message.deleteMany({where: {chatId: id}});
          await tx.chat.delete({where: {id}});
        }
      );
    }

    // Send response before socket events
    res.json({
      success: true,
      chatId: id,
      userId: req.user!.id,
      username: user?.username || "User",
    });

    // Emit socket events after response
    if (req.io) {
      req.io.emit("chat-deleted", {chatId: id});
    }
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({error: "Failed to delete chat"});
  }
};
