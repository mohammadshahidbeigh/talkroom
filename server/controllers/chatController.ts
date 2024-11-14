import {Request, Response} from "express";
import prisma from "../models";
import {Prisma} from "@prisma/client";

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

    // Validate required fields
    if (!name || !type || !participants || !Array.isArray(participants)) {
      return res.status(400).json({
        error:
          "Invalid request body. Required fields: name, type, and participants array",
      });
    }

    // For direct messages, check if a chat already exists between these users
    if (type === "direct" && participants.length === 1) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: "direct",
          AND: [
            {
              participants: {
                some: {
                  userId: req.user!.id,
                },
              },
            },
            {
              participants: {
                some: {
                  userId: participants[0],
                },
              },
            },
          ],
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      if (existingChat) {
        // Check if the current user is still a participant
        const isParticipant = existingChat.participants.some(
          (p) => p.userId === req.user!.id
        );

        if (!isParticipant) {
          // Re-add the user as a participant
          await prisma.participant.create({
            data: {
              userId: req.user!.id,
              chatId: existingChat.id,
            },
          });

          // Return the updated chat
          const updatedChat = await prisma.chat.findUnique({
            where: {id: existingChat.id},
            include: {
              participants: {
                include: {
                  user: true,
                },
              },
            },
          });

          return res.json(updatedChat);
        }

        return res.status(400).json({
          error: "A direct message chat already exists with this user",
          existingChat,
        });
      }
    }

    // Create new chat if no existing chat found
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

    // Find and delete the participant record
    const participant = await prisma.participant.findFirst({
      where: {
        AND: [{chatId: id}, {userId: req.user!.id}],
      },
    });

    if (participant) {
      await prisma.participant.delete({
        where: {
          id: participant.id,
        },
      });

      // Get user info for the system message
      const user = await prisma.user.findUnique({
        where: {id: req.user!.id},
        select: {username: true},
      });

      // Return the username for the socket event
      res.json({
        success: true,
        chatId: id,
        userId: req.user!.id,
        username: user?.username || "User",
      });
    }

    // If this was the last participant, then delete the entire chat
    if (chat.participants.length === 1) {
      await prisma.$transaction(async (tx) => {
        // Delete all messages first
        await tx.message.deleteMany({
          where: {chatId: id},
        });

        // Delete the chat
        await tx.chat.delete({
          where: {id},
        });
      });
    }
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({error: "Failed to delete chat"});
  }
};
