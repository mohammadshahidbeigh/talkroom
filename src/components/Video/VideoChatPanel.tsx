import React, {useState, useEffect, useRef} from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {FiSend, FiX} from "react-icons/fi";
import useSocket from "../../hooks/useSocket";
import useAppSelector from "../../hooks/useAppSelector";
import type {RootState} from "../../store";

interface Message {
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface VideoChatPanelProps {
  roomId: string;
  onClose: () => void;
}

export const VideoChatPanel: React.FC<VideoChatPanelProps> = ({
  roomId,
  onClose,
}) => {
  const socket = useSocket();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleChatMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("video-chat-message", handleChatMessage);

    return () => {
      socket.off("video-chat-message", handleChatMessage);
    };
  }, [socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      socket.emit("video-chat-message", {
        roomId,
        message: message.trim(),
        username: user.username,
      });
      setMessage("");
    }
  };

  return (
    <Paper
      sx={{
        width: 320,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Chat</Typography>
        <IconButton onClick={onClose}>
          <FiX />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{flex: 1, overflow: "auto", p: 2}}>
        {messages.map((msg, index) => (
          <ListItem
            key={index}
            sx={{flexDirection: "column", alignItems: "flex-start"}}
          >
            <Typography variant="caption" color="text.secondary">
              {msg.username}
            </Typography>
            <ListItemText primary={msg.message} />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Divider />
      <Box component="form" onSubmit={handleSendMessage} sx={{p: 2}}>
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          InputProps={{
            endAdornment: (
              <IconButton type="submit" disabled={!message.trim()}>
                <FiSend />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

export default VideoChatPanel;
