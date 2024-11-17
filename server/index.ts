import express, {ErrorRequestHandler} from "express";
import http from "http";
import {Server} from "socket.io";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import userRoutes from "./routes/user";
import videoRoutes from "./routes/video";
import messageRoutes from "./routes/message";
import uploadRoutes from "./routes/upload";
import initializeSocket from "./services/socket";
import {initializeWebRTC} from "./services/webrtc";
import {PrismaClient} from "@prisma/client";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
});
const prisma = new PrismaClient();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Register routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/message", messageRoutes);
app.use("/upload", uploadRoutes);

// Error handling middleware for JSON parsing errors
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({error: "Invalid JSON payload"});
    return;
  }
  next(err);
};

app.use(jsonErrorHandler);

// Initialize socket services with the same io instance
initializeSocket(io);
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

// Cleanup on server shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Cleaning up...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export default app;
