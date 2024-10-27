// client/src/contexts/SocketContext.tsx
import React, {createContext, useContext, useEffect} from "react";
import {connectSocket, disconnectSocket} from "../services/socket";

export const SocketContext = createContext<ReturnType<
  typeof connectSocket
> | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const socket = connectSocket();

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
