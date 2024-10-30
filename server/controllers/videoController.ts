import {Request, Response} from "express";
import prisma from "../models";
import {Prisma} from "@prisma/client";

// Create a Video Room
export const createVideoRoom = async (req: Request, res: Response) => {
  try {
    const videoRoom = await prisma.videoRoom.create({
      data: {
        participants: {
          create: [{userId: req.user!.id}],
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
    res.json(videoRoom);
  } catch (error) {
    console.error("Create video room error:", error);
    res.status(500).json({error: "Failed to create video room"});
  }
};

// Get Video Room by ID
export const getVideoRoom = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const videoRoom = await prisma.videoRoom.findUnique({
      where: {id},
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

    if (!videoRoom) {
      return res.status(404).json({error: "Video room not found"});
    }

    res.json(videoRoom);
  } catch (error) {
    console.error("Get video room error:", error);
    res.status(500).json({error: "Failed to fetch video room"});
  }
};

// End a Video Room
export const endVideoRoom = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    // Check if user is in the room
    const isParticipant = await prisma.videoRoomParticipant.findFirst({
      where: {
        roomId: id,
        userId: req.user!.id,
      },
    });

    if (!isParticipant) {
      return res.status(403).json({error: "Not authorized to end this room"});
    }

    const endedVideoRoom = await prisma.videoRoom.update({
      where: {id},
      data: {endedAt: new Date()},
    });
    res.json(endedVideoRoom);
  } catch (error) {
    console.error("End video room error:", error);
    res.status(500).json({error: "Failed to end video room"});
  }
};

// Add Participant to Video Room
export const addParticipant = async (req: Request, res: Response) => {
  try {
    const {roomId} = req.params;
    const {userId} = req.body;

    // Check if room exists
    const room = await prisma.videoRoom.findUnique({
      where: {id: roomId},
    });

    if (!room) {
      return res.status(404).json({error: "Video room not found"});
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {id: userId},
    });

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    // Check if participant already exists
    const existingParticipant = await prisma.videoRoomParticipant.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (existingParticipant) {
      return res.status(400).json({error: "User is already in this room"});
    }

    const participant = await prisma.videoRoomParticipant.create({
      data: {
        roomId,
        userId,
        status: "joined",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    res.json(participant);
  } catch (error) {
    console.error("Add participant error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return res.status(400).json({error: "Invalid user or room reference"});
      }
    }
    res.status(500).json({error: "Failed to add participant to room"});
  }
};

// Remove Participant from Video Room
export const removeParticipant = async (req: Request, res: Response) => {
  try {
    const {roomId, userId} = req.params;

    // Check if participant exists
    const participant = await prisma.videoRoomParticipant.findFirst({
      where: {
        roomId,
        userId,
      },
    });

    if (!participant) {
      return res.status(404).json({error: "Participant not found in room"});
    }

    await prisma.videoRoomParticipant.deleteMany({
      where: {
        roomId,
        userId,
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Remove participant error:", error);
    res.status(500).json({error: "Failed to remove participant from room"});
  }
};
