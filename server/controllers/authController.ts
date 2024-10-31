import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../models";
import config from "../config/default";

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
    },
  });

  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    return res.status(401).json({error: "Invalid credentials"});
  }

  const token = jwt.sign({userId: user.id}, config.jwtSecret as string);

  res.json({token, user: {...user, hashedPassword: undefined}});
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  const {username, email, fullName} = req.body;
  const updatedUser = await prisma.user.update({
    where: {id: req.user!.id},
    data: {username, email, fullName},
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
