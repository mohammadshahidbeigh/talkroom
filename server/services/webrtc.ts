import {Server} from "socket.io";

export const initializeWebRTC = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a video room
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Leave a video room
    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    // WebRTC offer for a specific room
    socket.on(
      "webrtc-offer",
      (roomId: string, offer: RTCSessionDescriptionInit) => {
        socket.to(roomId).emit("webrtc-offer", offer);
      }
    );

    // WebRTC answer for a specific room
    socket.on(
      "webrtc-answer",
      (roomId: string, answer: RTCSessionDescriptionInit) => {
        socket.to(roomId).emit("webrtc-answer", answer);
      }
    );

    // ICE candidate for a specific room
    socket.on(
      "ice-candidate",
      (roomId: string, candidate: RTCIceCandidateInit) => {
        socket.to(roomId).emit("ice-candidate", candidate);
      }
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
