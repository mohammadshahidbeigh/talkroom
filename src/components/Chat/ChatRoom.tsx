// client/src/components/Chat/ChatRoom.tsx
import {Box, Snackbar, Alert, useTheme, useMediaQuery} from "@mui/material";
import {Sidebar} from "../Layout";
import {useEffect, useState} from "react";
import useSocket from "../../hooks/useSocket";
import {messageApi} from "../../services/api";
import useAppSelector from "../../hooks/useAppSelector";
import {Chat, Message, User} from "../../types";
import ChatList from "./ChatList";
import MessageArea from "./MessageArea";
import api from "../../services/api";
import {
  useSendMessageMutation,
  useDeleteMessageMutation,
  useGetMessagesQuery,
} from "../../services/apiSlice";
import axios from "axios";

interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface DeletedMessageData {
  id: string;
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
}

const ChatRoom: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const socket = useSocket();

  // State declarations
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Use RTK Query hooks
  const [sendMessage] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const {data: messages} = useGetMessagesQuery(currentChat?.id ?? "", {
    skip: !currentChat,
  });

  useEffect(() => {
    if (messages) {
      setMessageList(messages);
    }
  }, [messages]);

  const handleCloseNotification = () => {
    setNotification((prev) => ({...prev, open: false}));
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentChat || !user) return;

    try {
      const messageData = {
        chatId: currentChat.id,
        content: messageInput.trim(),
        type: "text" as const,
      };

      const response = await sendMessage(messageData).unwrap();

      // Add the new message to the list immediately
      setMessageList((prev) => [...prev, response]);

      // Emit socket event for real-time
      socket?.emit("message", response);

      // Clear input
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      setNotification({
        open: true,
        message: "Failed to send message",
        severity: "error",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!currentChat || !user) return;

    // Update file size validation on client side to 500MB
    if (file.size > 500 * 1024 * 1024) {
      setNotification({
        open: true,
        message: "File size exceeds 500MB limit",
        severity: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Increase timeout for large files
        timeout: 600000, // 10 minutes
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          console.log(`Upload progress: ${percentCompleted}%`);
          // You could update UI to show progress here
        },
      });

      if (!uploadResponse.data?.url) {
        throw new Error("File upload failed");
      }

      // Send message with file URL
      const response = await sendMessage({
        chatId: currentChat.id,
        content: uploadResponse.data.url,
        type: "file",
      }).unwrap();

      setMessageList((prev) => [...prev, response]);
      socket?.emit("message", response);
    } catch (error) {
      console.error("Error uploading file:", error);
      let errorMessage = "Failed to upload file";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || errorMessage;
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const handleChatSelect = async (chat: Chat | null) => {
    setCurrentChat(chat);
    if (chat) {
      try {
        const response = await messageApi.getMessages(chat.id);
        setMessageList(response.data);
        setParticipants(chat.participants.map((p) => p.user));
      } catch (error) {
        console.error("Error fetching messages:", error);
        setNotification({
          open: true,
          message: "Failed to fetch messages",
          severity: "error",
        });
      }
    } else {
      setMessageList([]);
      setParticipants([]);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Call the delete mutation without storing the result
      await deleteMessage(messageId).unwrap();

      // Update local message list
      setMessageList(
        (prev: Message[]) =>
          prev.map((msg: Message) =>
            msg.id === messageId ? {...msg, type: "deleted", content: ""} : msg
          ) as Message[]
      );

      // Create the deletion event data with proper typing
      const deletionData: DeletedMessageData = {
        id: messageId,
        chatId: currentChat?.id || "",
        senderId: user?.id || "",
        type: "deleted",
        content: "",
        createdAt: new Date().toISOString(),
        sender: user
          ? {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl,
            }
          : undefined,
      };

      // Emit socket event with properly typed data
      socket?.emit("message-deleted", deletionData);

      setNotification({
        open: true,
        message: "Message deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      setNotification({
        open: true,
        message: "Failed to delete message",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (socket) {
      // Update message list when receiving a new message
      socket.on("message", (message: Message) => {
        console.log("Received message:", message);
        if (message.chatId === currentChat?.id) {
          console.log("Message is for current chat, updating list");
          setMessageList((prev) => {
            // Check if message already exists to prevent duplicates
            if (prev.some((m) => m.id === message.id)) {
              return prev;
            }

            // Only play notification sound for new text/file messages, not system messages
            if (message.senderId !== user?.id && message.type !== "system") {
              try {
                fetch("/src/public/notification.mp3")
                  .then((response) => {
                    if (response.ok) {
                      const audio = new Audio("/src/public/notification.mp3");
                      audio.play().catch((err) => {
                        console.log("Audio playback failed:", err);
                      });
                    } else {
                      console.log("Notification sound file not found");
                    }
                  })
                  .catch((err) => {
                    console.log("Failed to check for notification sound:", err);
                  });
              } catch (error) {
                console.log("Error playing notification sound:", error);
              }
            }

            return [...prev, message];
          });

          // Auto scroll to bottom when new message arrives
          setTimeout(() => {
            const messagesContainer = document.querySelector(
              ".messages-container"
            );
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        }
      });

      // Update message-deleted listener (remove audio)
      socket.on("message-deleted", (data) => {
        // Update message list
        setMessageList(
          (prev: Message[]) =>
            prev.map((msg: Message) =>
              msg.id === data.id ? {...msg, type: "deleted", content: ""} : msg
            ) as Message[]
        );

        // Show notification for other users
        if (data.senderId !== user?.id) {
          setNotification({
            open: true,
            message: data.notificationMessage || "A message was deleted",
            severity: "info" as const,
          });
        }
      });

      // Handle chat updates
      socket.on("chat-updated", async (updatedChat: Chat) => {
        console.log("Received chat update:", updatedChat);
        if (currentChat?.id === updatedChat.id) {
          // Update current chat
          setCurrentChat(updatedChat);
          // Refresh messages
          const response = await messageApi.getMessages(updatedChat.id);
          setMessageList(response.data);
          setParticipants(updatedChat.participants.map((p) => p.user));
        }
      });

      // Handle participant leaving - removed notification sound
      socket.on("participant-left", async ({chatId, username}) => {
        console.log(`Participant ${username} left chat ${chatId}`);
        if (chatId === currentChat?.id) {
          // Create a system message locally
          const systemMessage: Message = {
            id: `system-${Date.now()}`,
            content: `${username} left the chat`,
            type: "system",
            senderId: "system",
            chatId: chatId,
            createdAt: new Date().toISOString(),
            sender: {
              id: "system",
              username: "System",
              email: "",
              fullName: "System",
              status: "",
              createdAt: "",
              updatedAt: "",
            },
          };

          // Add system message to message list
          setMessageList((prev) => [...prev, systemMessage]);

          // Refresh participants list
          const chatResponse = await messageApi.getChat(chatId);
          if (chatResponse.data) {
            setParticipants(chatResponse.data.participants.map((p) => p.user));
          }

          // Auto scroll to bottom
          setTimeout(() => {
            const messagesContainer = document.querySelector(
              ".messages-container"
            );
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        }
      });

      // Join the chat room when selecting a chat
      if (currentChat) {
        socket.emit("join-chat", currentChat.id);
      }

      return () => {
        // Leave the chat room when unmounting or changing chats
        if (currentChat) {
          socket.emit("leave-chat", currentChat.id);
        }
        socket.off("message");
        socket.off("chat-updated");
        socket.off("participant-left");
        socket.off("message-deleted");
      };
    }
  }, [socket, currentChat, user]);

  useEffect(() => {
    setIsMobileView(isMobile);
    setShowChatList(isMobile && !currentChat);
  }, [isMobile, currentChat]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          marginLeft: {xs: 0, sm: "240px"},
          overflow: "hidden",
        }}
      >
        {(!isMobileView || (isMobileView && showChatList)) && (
          <ChatList
            currentChat={currentChat}
            onChatSelect={(chat) => {
              handleChatSelect(chat);
              if (isMobileView) {
                setShowChatList(false);
              }
            }}
          />
        )}

        {(!isMobileView || (isMobileView && !showChatList)) && (
          <MessageArea
            currentChat={currentChat}
            messages={messageList}
            setMessages={setMessageList}
            participants={participants}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{width: "100%"}}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatRoom;
