import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../models";
import config from "../config/default";
import {setUserSession, getUserSession} from "../services/redis";

// Register
export const register = async (req: Request, res: Response) => {
  const {username, email, password, fullName} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      hashedPassword,
      status: "online",
    },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(user);
};

// Login
export const login = async (req: Request, res: Response) => {
  const {email, password} = req.body;
  const user = await prisma.user.findUnique({
    where: {email},
    select: {
      id: true,
      username: true,
      hashedPassword: true,
      email: true,
      fullName: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    return res.status(401).json({error: "Invalid credentials"});
  }

  const token = jwt.sign({userId: user.id}, config.jwtSecret as string);

  const {...userWithoutPassword} = user;
  await setUserSession(user.id, {
    id: user.id,
    email: user.email,
    lastLogin: new Date(),
  });
  res.json({token, user: userWithoutPassword});
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  const {username, email, fullName, avatarUrl} = req.body;
  const updatedUser = await prisma.user.update({
    where: {id: req.user!.id},
    data: {
      username,
      email,
      fullName,
      avatarUrl,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(updatedUser);
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  await prisma.user.delete({
    where: {id: req.user!.id},
  });
  res.status(204).send();
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const {currentPassword, newPassword} = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: {id: req.user!.id},
      select: {
        id: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!isPasswordValid) {
      return res.status(401).json({error: "Current password is incorrect"});
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: {id: user.id},
      data: {
        hashedPassword,
      },
    });

    res.json({message: "Password updated successfully"});
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({error: "Failed to update password"});
  }
};
