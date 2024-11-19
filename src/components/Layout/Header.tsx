import {useNavigate} from "react-router-dom";
import {
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Box,
  Badge,
  Avatar,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useMediaQuery,
} from "@mui/material";
import {
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMessageCircle,
  FiVideo,
} from "react-icons/fi";
import {useState, useEffect} from "react";
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/authSlice";
import useAppSelector from "../../hooks/useAppSelector";
import useSocket from "../../hooks/useSocket";

interface User {
  id: string;
  fullName?: string;
  avatarUrl?: string;
}

interface Notification {
  id: string;
  type: "message" | "video" | "system";
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatParticipant {
  user: {
    id: string;
    username: string;
  };
}

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();
  const socket = useSocket();
  const user = useAppSelector((state) => state.auth.user) as User;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Handle socket events for notifications
  useEffect(() => {
    if (socket) {
      socket.on("message", (message) => {
        if (message.senderId !== user?.id) {
          addNotification({
            type: "message",
            content: `New message from ${message.sender.username}`,
          });
        }
      });

      socket.on("video-room-created", ({creator}) => {
        if (creator !== user?.fullName) {
          addNotification({
            type: "video",
            content: `${creator} started a video call`,
          });
        }
      });

      socket.on("chat-created", (chat) => {
        if (
          chat.participants.some((p: ChatParticipant) => p.user.id === user?.id)
        ) {
          addNotification({
            type: "system",
            content:
              chat.type === "direct"
                ? `New chat created with ${
                    chat.participants.find(
                      (p: ChatParticipant) => p.user.id !== user?.id
                    )?.user.username
                  }`
                : `You were added to group "${chat.name}"`,
          });
        }
      });

      return () => {
        socket.off("message");
        socket.off("video-room-created");
        socket.off("chat-created");
      };
    }
  }, [socket, user]);

  const addNotification = ({
    type,
    content,
  }: {
    type: Notification["type"];
    content: string;
  }) => {
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev.slice(0, 9),
    ]); // Keep last 10 notifications
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
    // Mark all notifications as read
    setNotifications((prev) => prev.map((n) => ({...n, read: true})));
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return <FiMessageCircle />;
      case "video":
        return <FiVideo />;
      default:
        return <FiBell />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Paper
      elevation={3}
      sx={{
        px: {xs: 2, sm: 3},
        py: {xs: 1.5, sm: 2},
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 0,
      }}
    >
      <Box sx={{display: "flex", alignItems: "center", gap: {xs: 1, sm: 2}}}>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mt: 1,
            ml: {xs: 4, sm: 1},
          }}
        >
          {isMobile ? "Dashboard" : "Dashboard"}
        </Typography>
      </Box>

      <Box sx={{display: "flex", alignItems: "center", gap: {xs: 1, sm: 2}}}>
        <Tooltip title="Notifications">
          <IconButton
            onClick={handleNotificationClick}
            size={isMobile ? "small" : "medium"}
            sx={{
              "&:hover": {color: theme.palette.primary.main},
              transition: "color 0.2s",
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <FiBell />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 3,
            sx: {
              width: {xs: 280, sm: 320},
              maxHeight: {xs: 350, sm: 400},
            },
          }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{px: 2, py: 1}}
          >
            Notifications
          </Typography>
          <Divider />
          <List sx={{p: 0}}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? "transparent" : "action.hover",
                    py: {xs: 1, sm: 1.5},
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: isMobile ? 32 : 40,
                        height: isMobile ? 32 : 40,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.content}
                    secondary={formatNotificationTime(notification.timestamp)}
                    primaryTypographyProps={{
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    }}
                    secondaryTypographyProps={{
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  sx={{color: "text.secondary"}}
                />
              </ListItem>
            )}
          </List>
        </Menu>

        {!isMobile && (
          <Tooltip title="Settings">
            <IconButton
              onClick={() => navigate("/profile")}
              size={isMobile ? "small" : "medium"}
              sx={{
                "&:hover": {color: theme.palette.primary.main},
                transition: "color 0.2s",
              }}
            >
              <FiSettings />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Profile">
          <Avatar
            src={user?.avatarUrl}
            alt={user?.fullName || "User"}
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
              },
              bgcolor: theme.palette.primary.main,
              width: isMobile ? 32 : 40,
              height: isMobile ? 32 : 40,
            }}
            onClick={handleMenuOpen}
          />
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: {xs: 160, sm: 180},
            },
          }}
        >
          <MenuItem
            onClick={() => {
              navigate("/profile");
              handleMenuClose();
            }}
          >
            <FiUser style={{marginRight: 8}} />
            Profile
          </MenuItem>
          {isMobile && (
            <MenuItem
              onClick={() => {
                navigate("/profile");
                handleMenuClose();
              }}
            >
              <FiSettings style={{marginRight: 8}} />
              Settings
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleLogout} sx={{color: "error.main"}}>
            <FiLogOut style={{marginRight: 8}} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Paper>
  );
};

export default Header;
