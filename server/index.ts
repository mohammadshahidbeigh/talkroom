import express, {ErrorRequestHandler} from "express";
import http from "http";
import {Server} from "socket.io";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import userRoutes from "./routes/user";
import videoRoutes from "./routes/video";
import messageRoutes from "./routes/message";
import initializeSocket from "./services/socket";
import {initializeWebRTC} from "./services/webrtc";
import {PrismaClient} from "@prisma/client";
import {testRedisConnection} from "./services/redis";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/message", messageRoutes);

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

// Test Redis connection on startup
testRedisConnection()
  .then((success) => {
    if (success) {
      console.log("Redis test successful");
    } else {
      console.log("Redis test failed");
    }
  })
  .catch(console.error);

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
