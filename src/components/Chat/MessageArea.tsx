import {
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Paper,
  InputAdornment,
  Popover,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  FiSend,
  FiPaperclip,
  FiSmile,
  FiDownload,
  FiX,
  FiMoreVertical,
  FiTrash2,
  FiCopy,
  FiLock,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import {Chat, Message} from "../../types";
import {useRef, useEffect, useState} from "react";
import useAppSelector from "../../hooks/useAppSelector";
import {styled} from "@mui/material/styles";
import EmojiPicker, {EmojiClickData} from "emoji-picker-react";

interface MessageSender {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface MessageAreaProps {
  currentChat: Chat | null;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  participants: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  }[];
  messageInput: string;
  setMessageInput: (value: string | ((prev: string) => string)) => void;
  onSendMessage: () => void;
  onFileUpload: (file: File) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

interface FilePreview {
  file: File;
  url: string;
  type: string;
}

interface DownloadStatus {
  messageId: string;
  status: "downloading" | "success" | "hidden" | null;
}

const HiddenInput = styled("input")({
  display: "none",
});

const MessageArea: React.FC<MessageAreaProps> = ({
  currentChat,
  messages,
  setMessages,
  participants,
  messageInput,
  setMessageInput,
  onSendMessage,
  onFileUpload,
  onDeleteMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({
    messageId: "",
    status: null,
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMessageSender = (message: Message): MessageSender => {
    if (message.senderId === currentUser?.id) {
      return {
        id: currentUser.id,
        username: "You",
        avatarUrl: currentUser.avatarUrl || null,
      };
    }

    if (message.sender) {
      return {
        id: message.sender.id,
        username: message.sender.username,
        avatarUrl: message.sender.avatarUrl || null,
      };
    }

    const participantSender = participants.find(
      (p) => p.id === message.senderId
    );
    if (participantSender) {
      return {
        id: participantSender.id,
        username: participantSender.username,
        avatarUrl: participantSender.avatarUrl || null,
      };
    }

    return {
      id: message.senderId,
      username: "Unknown User",
      avatarUrl: null,
    };
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);
        setFilePreview({
          file,
          url: previewUrl,
          type: file.type.split("/")[0],
        });
        setNotification({
          open: true,
          message: "File selected and ready to upload",
          severity: "info",
        });
      } catch (error) {
        console.error("Error creating file preview:", error);
        setNotification({
          open: true,
          message: "Failed to preview file",
          severity: "error",
        });
      }
    }
  };

  const handleUploadFile = async () => {
    if (filePreview) {
      try {
        await onFileUpload(filePreview.file);
        clearFilePreview();
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const clearFilePreview = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview.url);
      setFilePreview(null);
    }
  };

  const renderFilePreview = () => {
    if (!filePreview) return null;

    return (
      <Box
        sx={{
          position: "relative",
          mb: 2,
          maxWidth: "300px",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
      >
        {filePreview.type === "image" ? (
          <img
            src={filePreview.url}
            alt="Preview"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "200px",
              objectFit: "contain",
            }}
          />
        ) : filePreview.type === "video" ? (
          <video
            src={filePreview.url}
            controls
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "200px",
            }}
          />
        ) : (
          <Box sx={{p: 2, display: "flex", alignItems: "center", gap: 1}}>
            <FiPaperclip />
            <Typography noWrap>{filePreview.file.name}</Typography>
          </Box>
        )}
        <IconButton
          size="small"
          onClick={clearFilePreview}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.7)",
            },
          }}
        >
          <FiX />
        </IconButton>
      </Box>
    );
  };

  const handleDownload = async (
    messageId: string,
    fileUrl: string,
    fileName: string
  ) => {
    try {
      setDownloadStatus({messageId, status: "downloading"});
      setNotification({
        open: true,
        message: "Downloading file...",
        severity: "info",
      });

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadStatus({messageId, status: "success"});
      setNotification({
        open: true,
        message: "File downloaded successfully!",
        severity: "success",
      });

      setTimeout(() => {
        setDownloadStatus({messageId, status: "hidden"});
      }, 2000);

      const downloadedFiles = JSON.parse(
        localStorage.getItem("downloadedFiles") || "{}"
      );
      downloadedFiles[messageId] = true;
      localStorage.setItem("downloadedFiles", JSON.stringify(downloadedFiles));
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadStatus({messageId: "", status: null});
      setNotification({
        open: true,
        message: "Failed to download file. Please try again.",
        severity: "error",
      });
    }
  };

  const renderDownloadButton = (
    messageId: string,
    fileUrl: string,
    fileName: string,
    isCurrentUser: boolean
  ) => {
    if (isCurrentUser) {
      return null;
    }

    const isDownloading =
      downloadStatus.messageId === messageId &&
      downloadStatus.status === "downloading";
    const isSuccess =
      downloadStatus.messageId === messageId &&
      downloadStatus.status === "success";
    const isHidden =
      downloadStatus.messageId === messageId &&
      downloadStatus.status === "hidden";

    if (isHidden) {
      return null;
    }

    return (
      <IconButton
        size="small"
        onClick={() => handleDownload(messageId, fileUrl, fileName)}
        disabled={isDownloading}
        sx={{
          color: "primary.main",
          position: "relative",
        }}
      >
        {isDownloading ? (
          <CircularProgress size={16} color="inherit" />
        ) : isSuccess ? (
          <FiCheck style={{color: "#4caf50"}} />
        ) : (
          <FiDownload />
        )}
      </IconButton>
    );
  };

  const renderMessage = (
    message: Message,
    _sender: MessageSender,
    isCurrentUser: boolean
  ) => {
    if (message.type === "system") {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            my: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              bgcolor: "action.hover",
              px: 3,
              py: 1,
              borderRadius: 2,
              fontStyle: "italic",
            }}
          >
            {message.content}
          </Typography>
        </Box>
      );
    }

    if (message.type === "file") {
      const fileUrl = message.content;
      const fileName = decodeURIComponent(fileUrl.split("/").pop() || "");
      const fileExtension = fileName.split(".").pop()?.toLowerCase();
      const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
        fileExtension || ""
      );
      const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension || "");

      if (isImage) {
        return (
          <Box sx={{maxWidth: "300px"}}>
            <img
              src={fileUrl}
              alt="Shared image"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "4px",
                marginBottom: "4px",
                cursor: !isCurrentUser ? "pointer" : "default",
              }}
              loading="lazy"
              onClick={() =>
                !isCurrentUser && handleDownload(message.id, fileUrl, fileName)
              }
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.onerror = null;
                img.src = "/placeholder-image.png";
              }}
            />
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <Typography variant="caption">{fileName}</Typography>
              {renderDownloadButton(
                message.id,
                fileUrl,
                fileName,
                isCurrentUser
              )}
            </Box>
          </Box>
        );
      } else if (isVideo) {
        return (
          <Box sx={{maxWidth: "300px"}}>
            <video
              src={fileUrl}
              controls
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "4px",
                marginBottom: "4px",
              }}
            />
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <Typography variant="caption">{fileName}</Typography>
              {renderDownloadButton(
                message.id,
                fileUrl,
                fileName,
                isCurrentUser
              )}
            </Box>
          </Box>
        );
      } else {
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              maxWidth: "300px",
            }}
          >
            <FiPaperclip size={24} />
            <Box
              sx={{
                flexGrow: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Typography variant="body2">{fileName}</Typography>
            </Box>
            {renderDownloadButton(message.id, fileUrl, fileName, isCurrentUser)}
          </Box>
        );
      }
    }

    if (message.type === "deleted") {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.disabled",
            fontStyle: "italic",
            bgcolor: "action.hover",
            px: 2,
            py: 1,
            borderRadius: 1,
          }}
        >
          <FiAlertCircle size={16} />
          <Typography variant="body2">This message has been deleted</Typography>
          <Typography variant="caption" sx={{ml: "auto", opacity: 0.7}}>
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      );
    }

    return <Typography variant="body1">{message.content}</Typography>;
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev: string) => prev + emojiData.emoji);
    setAnchorEl(null); // Close emoji picker
  };

  const handleEmojiButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleMessageContextMenu = (
    event: React.MouseEvent,
    message: Message
  ) => {
    event.preventDefault();
    setSelectedMessage(message);
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedMessage(null);
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage.content);
      setNotification({
        open: true,
        message: "Message copied to clipboard",
        severity: "success",
      });
    }
    handleCloseContextMenu();
  };

  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      try {
        await onDeleteMessage(selectedMessage.id);
        const updatedMessages = messages.map((msg) =>
          msg.id === selectedMessage.id
            ? {...msg, type: "deleted" as const, content: ""}
            : msg
        );
        setMessages(updatedMessages);
      } catch (error) {
        console.error("Error deleting message:", error);
        setNotification({
          open: true,
          message: "Failed to delete message",
          severity: "error",
        });
      }
    }
    handleCloseContextMenu();
  };

  useEffect(() => {
    const downloadedFiles = JSON.parse(
      localStorage.getItem("downloadedFiles") || "{}"
    );

    Object.keys(downloadedFiles).forEach((messageId) => {
      if (downloadedFiles[messageId]) {
        setDownloadStatus({messageId, status: "hidden"});
      }
    });
  }, []);

  if (!currentChat) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            ml: {xs: 4, sm: 1},
          }}
        >
          <Box>
            <Typography variant="h6">
              {currentChat?.name || "Ongoing Chat"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentChat?.type === "direct"
                ? participants.find((p) => p.id !== currentUser?.id)
                    ?.username || ""
                : participants
                    .map((p) => (p.id === currentUser?.id ? "You" : p.username))
                    .join(", ")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "success.main",
              fontSize: "0.875rem",
            }}
          >
            <FiLock size={16} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                letterSpacing: 0.25,
              }}
            >
              End-to-end encrypted
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Messages Area */}
      <Box sx={{flexGrow: 1, overflow: "auto", p: 2}}>
        {messages.map((message) => {
          const sender = getMessageSender(message);
          const isCurrentUser = message.senderId === currentUser?.id;

          if (message.type === "system") {
            return (
              <Box key={message.id} className="messages-container">
                {renderMessage(message, sender, isCurrentUser)}
              </Box>
            );
          }

          return (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                mb: 2,
              }}
              onContextMenu={(e) => handleMessageContextMenu(e, message)}
              className="messages-container"
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: "70%",
                  bgcolor: isCurrentUser ? "primary.main" : "background.paper",
                  color: isCurrentUser ? "white" : "text.primary",
                  borderRadius: 2,
                  position: "relative",
                  "&:hover .message-actions": {
                    opacity: 1,
                  },
                }}
              >
                {!isCurrentUser && (
                  <Box sx={{display: "flex", alignItems: "center", mb: 1}}>
                    <Avatar
                      src={sender.avatarUrl || undefined}
                      sx={{width: 24, height: 24, mr: 1}}
                    >
                      {sender.username[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Typography variant="body2" fontWeight="bold">
                      {sender.username}
                    </Typography>
                  </Box>
                )}
                {renderMessage(message, sender, isCurrentUser)}
                <Typography
                  variant="caption"
                  sx={{display: "block", mt: 0.5, opacity: 0.8}}
                >
                  {formatTime(message.createdAt)}
                </Typography>

                {/* Message actions */}
                <Box
                  className="message-actions"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMessageContextMenu(e, message);
                    }}
                    sx={{
                      color: isCurrentUser ? "white" : "text.primary",
                      opacity: 0.7,
                      "&:hover": {opacity: 1},
                    }}
                  >
                    <FiMoreVertical />
                  </IconButton>
                </Box>
              </Paper>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? {top: contextMenu.mouseY, left: contextMenu.mouseX}
            : undefined
        }
      >
        <MenuItem onClick={handleCopyMessage}>
          <FiCopy style={{marginRight: 8}} />
          Copy
        </MenuItem>
        {selectedMessage?.senderId === currentUser?.id && (
          <MenuItem onClick={handleDeleteMessage} sx={{color: "error.main"}}>
            <FiTrash2 style={{marginRight: 8}} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Message Input */}
      <Box
        sx={{
          p: 1,
          bgcolor: "background.paper",
          position: "sticky",
          bottom: 0,
          zIndex: 1,
        }}
      >
        {filePreview && renderFilePreview()}
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          multiline
          maxRows={4}
          size="small"
          sx={{
            "& .MuiInputBase-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Box sx={{display: "flex", gap: 1}}>
                  <label htmlFor="file-upload">
                    <HiddenInput
                      id="file-upload"
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,application/*"
                    />
                    <IconButton component="span" size="small">
                      <FiPaperclip />
                    </IconButton>
                  </label>
                  <IconButton onClick={handleEmojiButtonClick} size="small">
                    <FiSmile />
                  </IconButton>
                  <IconButton
                    onClick={filePreview ? handleUploadFile : onSendMessage}
                    color="primary"
                    disabled={!messageInput.trim() && !filePreview}
                    size="small"
                  >
                    <FiSend />
                  </IconButton>
                </Box>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseEmojiPicker}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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

export default MessageArea;
