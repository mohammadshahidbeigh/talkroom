import {Server, Socket} from "socket.io";

export const initializeWebRTC = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    // Handle WebRTC signaling
    socket.on("offer", ({offer, remoteUserId, roomId}) => {
      console.log(
        `Relaying offer from ${socket.id} to ${remoteUserId} in room ${roomId}`
      );
      socket.to(roomId).emit("offer", {
        offer,
        remoteUserId: socket.id,
      });
    });

    socket.on("answer", ({answer, remoteUserId, roomId}) => {
      console.log(
        `Relaying answer from ${socket.id} to ${remoteUserId} in room ${roomId}`
      );
      socket.to(roomId).emit("answer", {
        answer,
        remoteUserId: socket.id,
      });
    });

    socket.on("ice-candidate", ({candidate, remoteUserId, roomId}) => {
      console.log(
        `Relaying ICE candidate from ${socket.id} to ${remoteUserId}`
      );
      socket.to(roomId).emit("ice-candidate", {
        candidate,
        remoteUserId: socket.id,
      });
    });

    // Handle screen sharing
    socket.on("start-screen-share", ({roomId}) => {
      socket.to(roomId).emit("user-screen-share-started", {
        userId: socket.id,
      });
    });

    socket.on("stop-screen-share", ({roomId}) => {
      socket.to(roomId).emit("user-screen-share-stopped", {
        userId: socket.id,
      });
    });

    // Handle chat messages in video room
    socket.on("video-chat-message", ({roomId, message, username}) => {
      io.to(roomId).emit("video-chat-message", {
        userId: socket.id,
        username,
        message,
        timestamp: new Date(),
      });
    });

    // Handle user status updates
    socket.on("user-status-update", ({roomId, status}) => {
      socket.to(roomId).emit("user-status-updated", {
        userId: socket.id,
        status,
      });
    });

    // Handle room events
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      const usersInRoom = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      ).filter((id) => id !== socket.id);

      // Notify the joining user about existing participants
      socket.emit("room-users", {
        users: usersInRoom,
        roomId,
      });

      // Notify others about the new user
      socket.to(roomId).emit("user-joined", {
        userId: socket.id,
        roomId,
      });
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", {
        userId: socket.id,
        roomId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit("user-left", {
            userId: socket.id,
            roomId,
          });
        }
      });
    });
  });
};
