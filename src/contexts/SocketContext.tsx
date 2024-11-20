// client/src/contexts/SocketContext.tsx
import React, {useEffect, useRef} from "react";
import {io} from "socket.io-client";
import {SocketContext} from "./SocketContextValue";

const SOCKET_URL = "https://talk-room-server.vercel.app";

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const socketRef = useRef(
    io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      transports: ["websocket", "polling"],
      path: "/socket.io/",
      withCredentials: true,
    })
  );

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket.connected) {
      socket.connect();
      console.log("Socket connected successfully");

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
