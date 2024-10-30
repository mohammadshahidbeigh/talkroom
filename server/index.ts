import express from "express";
import http from "http";
import {Server} from "socket.io";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import userRoutes from "./routes/user";
import initializeSocket from "./services/socket";
import {initializeWebRTC} from "./services/webrtc";
import {PrismaClient} from "@prisma/client";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const prisma = new PrismaClient();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);

initializeSocket(server);
initializeWebRTC(io);

const PORT = process.env.PORT || 5000;

prisma
  .$connect()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
