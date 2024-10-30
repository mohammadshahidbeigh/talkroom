import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../models";
import config from "../config/default";

export const register = async (req: Request, res: Response) => {
  const {username, email, password, fullName} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Explicitly type the data object
  const userData = {
    username,
    email,
    fullName,
    hashedPassword,
    status: "online" as const,
  };

  const user = await prisma.user.create({
    data: userData,
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

export const login = async (req: Request, res: Response) => {
  const {username, password} = req.body;
  const user = await prisma.user.findUnique({
    where: {username},
    select: {
      id: true,
      username: true,
      hashedPassword: true,
      email: true,
      fullName: true,
      status: true,
      avatarUrl: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    return res.status(401).json({error: "Invalid credentials"});
  }

  const token = jwt.sign({userId: user.id}, config.jwtSecret as string);

  // Remove hashedPassword from response using object destructuring
  const userWithoutPassword = Object.fromEntries(
    Object.entries(user).filter(([key]) => key !== "hashedPassword")
  );
  res.json({token, user: userWithoutPassword});
};
