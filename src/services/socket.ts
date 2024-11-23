// client/src/services/socket.ts
import {io, Socket} from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io("https://talkroom-server-latest.onrender.com/"); // Replace with your server URL
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
