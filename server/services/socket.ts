import {Server} from "socket.io";
import http from "http";

export default (server: http.Server) => {
  const io = new Server(server, {cors: {origin: "*"}});

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("message", (msg) => {
      io.emit("message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
