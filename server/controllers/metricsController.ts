import {Request, Response} from "express";
import prisma from "../models";

export const getMetrics = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalChats, totalVideoRooms] = await Promise.all([
      prisma.user.count(),
      prisma.chat.count({
        where: {
          participants: {
            some: {
              userId: req.user!.id,
            },
          },
        },
      }),
      prisma.videoRoom.count({
        where: {
          endedAt: null,
          participants: {
            some: {
              userId: req.user!.id,
            },
          },
        },
      }),
    ]);

    res.setHeader("Content-Type", "application/json");
    res.json({
      totalUsers,
      activeChats: totalChats,
      videoRooms: totalVideoRooms,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({error: "Failed to fetch metrics"});
  }
};
