import {Server} from "socket.io";
import prisma from "../models";

export default (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific chat room
    socket.on("join-chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    // Leave a chat room
    socket.on("leave-chat", (chatId: string) => {
      socket.leave(chatId);
      console.log(`User ${socket.id} left chat ${chatId}`);
    });

    // Handle participant leaving chat
    socket.on("participant-left", async ({chatId, userId, username}) => {
      try {
        console.log(`User ${username} is leaving chat ${chatId}`);

        // Create system message about user leaving
        const systemMessage = await prisma.message.create({
          data: {
            chatId,
            content: `${username} left the chat`,
            type: "system",
            senderId: userId,
          },
          include: {
            sender: true,
          },
        });

        console.log("Created system message:", systemMessage);

        // Broadcast the system message to the chat room
        io.to(chatId).emit("message", systemMessage);
        console.log("Emitted system message to room:", chatId);

        // Get updated chat after participant left
        const updatedChat = await prisma.chat.findUnique({
          where: {id: chatId},
          include: {
            participants: {
              include: {
                user: true,
              },
            },
            messages: {
              include: {
                sender: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        });

        // Broadcast updates to all clients
        if (updatedChat) {
          io.emit("chat-updated", updatedChat);
          console.log("Emitted chat update");
        }
        io.emit("participant-left", {chatId, userId, username});
        console.log("Emitted participant-left event");
      } catch (error) {
        console.error("Error handling participant leaving:", error);
      }
    });

    // Handle new message
    socket.on("message", async (message) => {
      try {
        // Get updated chat with latest message
        const updatedChat = await prisma.chat.findUnique({
          where: {id: message.chatId},
          include: {
            participants: {
              include: {
                user: true,
              },
            },
            messages: {
              include: {
                sender: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        });

        // Broadcast both the message and updated chat
        io.emit("message", message);
        if (updatedChat) {
          io.emit("chat-updated", updatedChat);
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    // Handle message deletion
    socket.on("message-deleted", async (data) => {
      try {
        const updatedChat = await prisma.chat.findUnique({
          where: {id: data.chatId},
          include: {
            participants: {
              include: {
                user: true,
              },
            },
            messages: {
              include: {
                sender: true,
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        });

        io.emit("message-deleted", data);
        if (updatedChat) {
          io.emit("chat-updated", updatedChat);
        }
      } catch (error) {
        console.error("Error handling message deletion:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
