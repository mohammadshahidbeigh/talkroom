import React, {useState, useEffect, useRef} from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  useTheme,
  alpha,
} from "@mui/material";
import {FiSend, FiX, FiMessageCircle} from "react-icons/fi";
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

const VideoChatPanel: React.FC<VideoChatPanelProps> = ({roomId, onClose}) => {
  const socket = useSocket();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

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
        bgcolor: "background.paper",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
          <FiMessageCircle size={24} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{fontWeight: 600}}>
            Chat
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <FiX />
        </IconButton>
      </Box>

      <List sx={{flex: 1, overflow: "auto", p: 2}}>
        {messages.map((msg, index) => (
          <ListItem
            key={index}
            sx={{
              flexDirection: "column",
              alignItems: msg.userId === user?.id ? "flex-end" : "flex-start",
              px: 1,
              py: 0.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "80%",
                gap: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{color: "text.secondary", fontWeight: 500}}
              >
                {msg.username}
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor:
                    msg.userId === user?.id ? "primary.main" : "action.hover",
                  color: msg.userId === user?.id ? "white" : "text.primary",
                  borderRadius: 2,
                  borderTopRightRadius: msg.userId === user?.id ? 0 : 2,
                  borderTopLeftRadius: msg.userId === user?.id ? 2 : 0,
                }}
              >
                <Typography variant="body2">{msg.message}</Typography>
              </Paper>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          InputProps={{
            endAdornment: (
              <IconButton
                type="submit"
                disabled={!message.trim()}
                color="primary"
                sx={{
                  "&.Mui-disabled": {
                    color: alpha(theme.palette.text.primary, 0.3),
                  },
                }}
              >
                <FiSend />
              </IconButton>
            ),
            sx: {
              borderRadius: 3,
              "&.Mui-focused": {
                boxShadow: `0 0 0 2px ${alpha(
                  theme.palette.primary.main,
                  0.2
                )}`,
              },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default VideoChatPanel;
