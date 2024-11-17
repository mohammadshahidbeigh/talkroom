// client/src/hooks/useSocket.ts
import {useContext} from "react";
import {SocketContext} from "../contexts/SocketContextValue";
import type {Socket} from "socket.io-client";

const useSocket = (): Socket => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};

export default useSocket;
