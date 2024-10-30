import {Server} from "socket.io";

export const initializeWebRTC = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("webrtc-offer", (offer) => {
      socket.broadcast.emit("webrtc-offer", offer);
    });

    socket.on("webrtc-answer", (answer) => {
      socket.broadcast.emit("webrtc-answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
      socket.broadcast.emit("ice-candidate", candidate);
    });
  });
};
