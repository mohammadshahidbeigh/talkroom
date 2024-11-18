import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import {FiSearch, FiPlus, FiMoreVertical, FiTrash2} from "react-icons/fi";
import {Chat, CreateChatPayload} from "../../types";
import {useState, useEffect} from "react";
import CreateChatDialog from "./CreateChatDialog";
import {
  useGetChatsQuery,
  useDeleteChatMutation,
  useCreateChatMutation,
} from "../../services/apiSlice";
import useSocket from "../../hooks/useSocket"; // Use default import instead of named import
import useAppSelector from "../../hooks/useAppSelector";

interface ChatListProps {
  currentChat: Chat | null;
  onChatSelect: (chat: Chat | null) => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface DeleteChatResponse {
  success: boolean;
  chatId: string;
  userId: string;
  username: string;
}

const ChatList: React.FC<ChatListProps> = ({currentChat, onChatSelect}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const socket = useSocket();
  const [localChats, setLocalChats] = useState<Chat[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    chat: Chat | null;
  } | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
  });
  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    data: chats = [],
    isLoading,
    refetch,
  } = useGetChatsQuery(undefined, {
    pollingInterval: 0,
  });

  const [deleteChat] = useDeleteChatMutation();
  const [createChat] = useCreateChatMutation();

  useEffect(() => {
    setLocalChats(chats);
  }, [chats]);

  useEffect(() => {
    if (socket) {
      // Handle new messages
      socket.on("message", () => {
        console.log("Received new message, refreshing chats");
        refetch(); // Refresh chat list to update last messages
      });

      // Handle chat updates
      socket.on("chat-updated", () => {
        console.log("Chat updated, refreshing list");
        refetch();
      });

      // Handle participant leaving - removed notification sound
      socket.on("participant-left", ({username}) => {
        console.log(`${username} left chat, refreshing list`);
        refetch();
        // Show only visual notification
        setNotification({
          open: true,
          message: `${username} left the chat`,
          severity: "info",
        });
      });

      // Handle message deletion
      socket.on("message-deleted", () => {
        console.log("Message deleted, refreshing list");
        refetch();
      });

      return () => {
        socket.off("message");
        socket.off("chat-updated");
        socket.off("participant-left");
        socket.off("message-deleted");
      };
    }
  }, [socket, refetch]);

  const filteredChats = localChats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFirstParticipantAvatar = (chat: Chat) => {
    const firstParticipant = chat.participants?.[0]?.user;
    if (firstParticipant?.avatarUrl) {
      return firstParticipant.avatarUrl;
    }
    return undefined;
  };

  const getLastMessage = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return "No messages yet";
    }
    const lastMessage = chat.messages[chat.messages.length - 1];

    if (lastMessage.type === "file") {
      const fileName = lastMessage.content.split("/").pop();
      return `📎 ${fileName}`;
    }

    return lastMessage.content;
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === "group") {
      return chat.name || "Group Chat";
    }

    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants.find(
      (p) => p.user.id !== currentUser?.id
    );
    return otherParticipant?.user.username || "Chat";
  };

  const getAvatarInitial = (chat: Chat) => {
    const displayName = getChatDisplayName(chat);
    return displayName[0] || "C";
  };

  const handleChatContextMenu = (event: React.MouseEvent, chat: Chat) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      chat,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteChat = async () => {
    if (contextMenu?.chat) {
      try {
        const result = await deleteChat(contextMenu.chat.id).unwrap();
        // Type guard to check if result matches DeleteChatResponse
        const isDeleteChatResponse = (
          data: unknown
        ): data is DeleteChatResponse => {
          return (
            typeof data === "object" &&
            data !== null &&
            "success" in data &&
            "chatId" in data &&
            "userId" in data &&
            "username" in data
          );
        };

        if (!isDeleteChatResponse(result)) {
          throw new Error("Invalid response format");
        }

        if (currentChat?.id === contextMenu.chat.id) {
          onChatSelect(null);
        }

        // Emit socket event when user leaves
        socket?.emit("participant-left", {
          chatId: contextMenu.chat.id,
          userId: result.userId,
          username: result.username,
        });

        setNotification({
          open: true,
          message: "Left chat successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Failed to leave chat:", error);
        setNotification({
          open: true,
          message: "Failed to leave chat",
          severity: "error",
        });
      }
    }
    handleCloseContextMenu();
  };

  const checkChatExists = (participants: string[], type: string): boolean => {
    return chats.some((chat) => {
      if (type === "direct" && chat.type === "direct") {
        // For direct chats, check if the same two users are involved
        const chatParticipantIds = chat.participants
          .map((p) => p.userId)
          .sort();
        const newParticipantIds = [...participants].sort();
        return (
          JSON.stringify(chatParticipantIds) ===
          JSON.stringify(newParticipantIds)
        );
      } else if (type === "group" && chat.type === "group") {
        // For group chats, check if the same participants and name exist
        const chatParticipantIds = chat.participants
          .map((p) => p.userId)
          .sort();
        const newParticipantIds = [...participants].sort();
        return (
          JSON.stringify(chatParticipantIds) ===
          JSON.stringify(newParticipantIds)
        );
      }
      return false;
    });
  };

  const handleCreateChat = async (data: CreateChatPayload) => {
    try {
      // Check if chat already exists
      if (checkChatExists(data.participants, data.type)) {
        setNotification({
          open: true,
          message:
            data.type === "direct"
              ? "Opening existing chat..."
              : "Opening existing group chat...",
          severity: "info",
        });

        // Find the existing chat
        const existingChat = chats.find((chat) => {
          if (data.type === "direct" && chat.type === "direct") {
            const chatParticipantIds = chat.participants
              .map((p) => p.userId)
              .sort();
            const newParticipantIds = [...data.participants].sort();
            return (
              JSON.stringify(chatParticipantIds) ===
              JSON.stringify(newParticipantIds)
            );
          }
          return false;
        });

        if (existingChat) {
          onChatSelect(existingChat);
          setCreateDialogOpen(false);
        }
        return;
      }

      const response = await createChat(data).unwrap();
      onChatSelect(response);
      setCreateDialogOpen(false);
    } catch (error) {
      // Just log the error without showing notification
      console.error("Error creating chat:", error);
    }
  };

  const renderChatLabel = (chat: Chat) => {
    if (chat.type === "group") {
      return (
        <Chip
          label="G"
          size="small"
          color="primary"
          variant="outlined"
          sx={{
            height: "20px",
            fontSize: "0.75rem",
            position: "absolute",
            left: "8px",
            zIndex: 1,
          }}
        />
      );
    } else if (chat.type === "direct") {
      return (
        <Chip
          label="D"
          size="small"
          color="secondary"
          variant="outlined"
          sx={{
            height: "20px",
            fontSize: "0.75rem",
            position: "absolute",
            left: "8px",
            zIndex: 1,
          }}
        />
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        width: 320,
        borderRight: 1,
        borderColor: "divider",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{p: 2, display: "flex", gap: 1}}>
        <TextField
          fullWidth
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch />
              </InputAdornment>
            ),
          }}
        />
        <IconButton
          color="primary"
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {bgcolor: "primary.dark"},
          }}
        >
          <FiPlus />
        </IconButton>
      </Box>

      {isLoading ? (
        <Box sx={{display: "flex", justifyContent: "center", p: 2}}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{flexGrow: 1, overflow: "auto"}}>
          {filteredChats.map((chat) => (
            <ListItemButton
              key={chat.id}
              selected={currentChat?.id === chat.id}
              onClick={() => onChatSelect(chat)}
              onContextMenu={(e) => handleChatContextMenu(e, chat)}
              sx={{
                "&:hover": {bgcolor: "action.hover"},
                bgcolor:
                  currentChat?.id === chat.id ? "action.selected" : "inherit",
                position: "relative",
                pl: 6,
              }}
            >
              {renderChatLabel(chat)}
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                  variant="dot"
                  color="success"
                >
                  <Avatar src={getFirstParticipantAvatar(chat)}>
                    {getAvatarInitial(chat)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{display: "flex", alignItems: "center"}}>
                    <Typography variant="subtitle1" noWrap>
                      {getChatDisplayName(chat)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {getLastMessage(chat)}
                  </Typography>
                }
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChatContextMenu(e, chat);
                }}
                sx={{
                  opacity: 0.7,
                  "&:hover": {opacity: 1},
                }}
              >
                <FiMoreVertical />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      )}

      <Menu
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
            : undefined
        }
      >
        <MenuItem onClick={handleDeleteChat} sx={{color: "error.main"}}>
          <FiTrash2 style={{marginRight: 8}} />
          Delete Chat
        </MenuItem>
      </Menu>

      <CreateChatDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onChatCreated={handleCreateChat}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({...prev, open: false}))}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
      >
        <Alert
          onClose={() => setNotification((prev) => ({...prev, open: false}))}
          severity={notification.severity}
          sx={{width: "100%"}}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatList;
