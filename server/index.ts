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
import metricsRoutes from "./routes/metrics";
import {rateLimiter} from "./middleware/rateLimiter";
import {securityMiddleware} from "./middleware/security";
import {MAX_REQUESTS_PER_MINUTE} from "./middleware/rateLimiter";
import {staticMiddleware} from "./middleware/static";

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
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json({limit: "500mb"}));
app.use(express.urlencoded({extended: true, limit: "500mb"}));

// Increase timeout for large file transfers
app.use((req, res, next) => {
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Keep-Alive", "timeout=300");
  next();
});

// Add this middleware before your routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Apply security middleware
app.use(securityMiddleware);

// Apply rate limiting with different limits for different routes
app.use("/auth", rateLimiter(MAX_REQUESTS_PER_MINUTE.auth));
app.use("/upload", rateLimiter(MAX_REQUESTS_PER_MINUTE.upload));
app.use(rateLimiter()); // Default limit for other routes

// Apply static middleware (use spread operator since it's now an array)
app.use("/uploads", ...staticMiddleware);

// Register routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/message", messageRoutes);
app.use("/", uploadRoutes);
app.use("/metrics", metricsRoutes);

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
