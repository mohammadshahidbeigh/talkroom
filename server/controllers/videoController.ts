import {Request, Response} from "express";
import prisma from "../models";

// Create a Video Room
export const createVideoRoom = async (req: Request, res: Response) => {
  try {
    const videoRoom = await prisma.videoRoom.create({
      data: {
        creatorId: req.user!.id,
        participants: {
          create: [
            {
              userId: req.user!.id,
              status: "joined",
            },
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
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
    req.io?.emit("video-room-created", {creator: req.user?.username});
    res.json(videoRoom);
  } catch (error) {
    console.error("Create video room error:", error);
    res.status(500).json({error: "Failed to create video room"});
  }
};

// Join Video Room
export const joinVideoRoom = async (req: Request, res: Response) => {
  try {
    const {roomId} = req.params;

    // Check if room exists and is not ended
    const room = await prisma.videoRoom.findFirst({
      where: {
        id: roomId,
        endedAt: null,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({error: "Room not found or has ended"});
    }

    // Check if user is already in room
    const existingParticipant = room.participants.find(
      (p: {userId: string; leftAt: Date | null}) =>
        p.userId === req.user!.id && !p.leftAt
    );

    if (existingParticipant) {
      return res.json(room);
    }

    // Add user to room
    const updatedRoom = await prisma.videoRoom.update({
      where: {id: roomId},
      data: {
        participants: {
          create: [
            {
              user: {
                connect: {
                  id: req.user!.id,
                },
              },
              status: "joined",
            },
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
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedRoom);
  } catch (error) {
    console.error("Join video room error:", error);
    res.status(500).json({error: "Failed to join video room"});
  }
};

// Leave Video Room
export const leaveVideoRoom = async (req: Request, res: Response) => {
  try {
    const {roomId} = req.params;

    // Update participant status and set leftAt
    await prisma.videoRoomParticipant.updateMany({
      where: {
        roomId,
        userId: req.user!.id,
        leftAt: null,
      },
      data: {
        status: "left",
        leftAt: new Date(),
      },
    });

    // If no active participants left, end the room
    const remainingParticipants = await prisma.videoRoomParticipant.count({
      where: {
        roomId,
        leftAt: null,
      },
    });

    if (remainingParticipants === 0) {
      await prisma.videoRoom.update({
        where: {id: roomId},
        data: {endedAt: new Date()},
      });
      req.io?.emit("video-room-ended", {roomId});
    }

    res.status(200).json({message: "Left room successfully"});
  } catch (error) {
    console.error("Leave video room error:", error);
    res.status(500).json({error: "Failed to leave video room"});
  }
};

// Get Room Participants
export const getRoomParticipants = async (req: Request, res: Response) => {
  try {
    const {roomId} = req.params;

    const participants = await prisma.videoRoomParticipant.findMany({
      where: {
        roomId,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    res.json(participants);
  } catch (error) {
    console.error("Get participants error:", error);
    res.status(500).json({error: "Failed to get participants"});
  }
};
