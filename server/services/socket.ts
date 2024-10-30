import {Server} from "socket.io";

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

    // Send a message to a chat room
    socket.on("message", (chatId: string, message) => {
      socket.to(chatId).emit("message", message); // Send message to all users in chat room
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
