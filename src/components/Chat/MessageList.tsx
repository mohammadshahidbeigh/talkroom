// client/src/components/Chat/MessageList.tsx
import {useEffect, useState} from "react";
import {useSocket} from "../../contexts/SocketContext";

const MessageList = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("message", (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off("message");
      }
    };
  }, [socket]);

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          {msg}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
