import {Request, Response} from "express";
import prisma from "../models";

// Get User Profile
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {id: req.user!.id},
    });
    res.json(user);
  } catch {
    res.status(500).json({error: "Error fetching user profile"});
  }
};

// Update User Profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({error: "Request body cannot be empty"});
    }

    const {email, fullName, avatarUrl} = req.body;

    // Validate required fields
    if (email && typeof email !== "string") {
      return res.status(400).json({error: "Email must be a string"});
    }
    if (fullName && typeof fullName !== "string") {
      return res.status(400).json({error: "Full name must be a string"});
    }
    if (avatarUrl && typeof avatarUrl !== "string") {
      return res.status(400).json({error: "Avatar URL must be a string"});
    }

    // Only include defined fields in the update
    const updateData: {
      email?: string;
      fullName?: string;
      avatarUrl?: string;
    } = {};

    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: {id: req.user!.id},
      data: updateData,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({error: "Error updating user profile"});
  }
};

// Delete User Profile
export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: {id: req.user!.id},
    });
    res.status(204).send();
  } catch {
    res.status(500).json({error: "Error deleting user profile"});
  }
};

// Get Available Users (for chat creation)
export const getAvailableUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: req.user!.id, // Exclude current user
        },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        status: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching available users:", error);
    res.status(500).json({error: "Failed to fetch users"});
  }
};
