// client/src/components/Dashboard.tsx
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {FiUser, FiMessageCircle, FiVideo, FiTrendingUp} from "react-icons/fi";
import {Header, Sidebar} from "./Layout";
import useAppSelector from "../hooks/useAppSelector";
import {useGetChatsQuery} from "../services/apiSlice";
import {useEffect, useState, useCallback} from "react";
import useSocket from "../hooks/useSocket";

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than a minute
  if (diff < 60000) {
    return "Just now";
  }
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  // Otherwise show date
  return date.toLocaleDateString();
};

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  icon: JSX.Element;
}

// Add interface for chat participant
interface ChatParticipant {
  user: {
    id: string;
    username: string;
  };
}

// Add this constant for max activities to store
const MAX_ACTIVITIES = 10;

// Move getActivityIcon outside of the component
const getActivityIcon = (type: string): JSX.Element => {
  switch (type) {
    case "New User":
      return <FiUser />;
    case "Direct Chat":
    case "Group Chat":
    case "System":
      return <FiMessageCircle />;
    case "Video Call":
      return <FiVideo />;
    default:
      return <FiMessageCircle />;
  }
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const user = useAppSelector((state) => state.auth.user);
  const socket = useSocket();
  const {data: chats = [], refetch} = useGetChatsQuery();

  // State for dashboard metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeChats: 0,
    videoRooms: 0,
  });

  // State for recent activities
  const [recentActivities, setRecentActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem("recentActivities");
    if (saved) {
      try {
        // Parse the saved activities, but recreate the icon elements
        const parsed = JSON.parse(saved);
        return parsed.map((activity: any) => ({
          ...activity,
          icon: getActivityIcon(activity.type),
        }));
      } catch (e) {
        console.error("Error parsing saved activities:", e);
        return [];
      }
    }
    return [];
  });

  // Memoize the updateMetrics function
  const updateMetrics = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch("http://localhost:5000/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      setMetrics({
        totalUsers: 0,
        activeChats: 0,
        videoRooms: 0,
      });
    }
  }, []);

  // Listen for socket events to update metrics and activities
  useEffect(() => {
    if (socket && user) {
      // Initial fetch
      updateMetrics();

      socket.on("user-joined", ({username}) => {
        addActivity("New User", `${username} joined the platform`, <FiUser />);
        updateMetrics(); // Refresh metrics when new user joins
      });

      socket.on("chat-created", (chat) => {
        const chatType = chat.type === "direct" ? "Direct Chat" : "Group Chat";
        const description =
          chat.type === "direct"
            ? `New chat created with ${
                chat.participants.find(
                  (p: ChatParticipant) => p.user.id !== user?.id
                )?.user.username
              }`
            : `New group "${chat.name}" created`;

        addActivity(chatType, description, <FiMessageCircle />);
        updateMetrics(); // Refresh metrics when chat is created
        refetch(); // Refresh chat list
      });

      socket.on("chat-deleted", () => {
        updateMetrics(); // Refresh metrics when chat is deleted
        refetch(); // Refresh chat list
      });

      socket.on("video-room-created", ({creator}) => {
        addActivity(
          "Video Call",
          `${creator} started a video call`,
          <FiVideo />
        );
        updateMetrics(); // Refresh metrics when video room is created
      });

      socket.on("video-room-ended", () => {
        updateMetrics(); // Refresh metrics when video room ends
      });

      socket.on("video-room-joined", () => {
        updateMetrics(); // Add this handler to update metrics when someone joins a room
      });

      socket.on("video-room-left", () => {
        updateMetrics(); // Add this handler to update metrics when someone leaves a room
      });

      socket.on("message", (message) => {
        if (message.type === "system") {
          addActivity("System", message.content, <FiMessageCircle />);
          updateMetrics(); // Refresh metrics for system events
        }
      });

      // Set up polling for metrics
      const metricsInterval = setInterval(updateMetrics, 30000); // Update every 30 seconds

      return () => {
        socket.off("user-joined");
        socket.off("chat-created");
        socket.off("chat-deleted");
        socket.off("video-room-created");
        socket.off("video-room-ended");
        socket.off("video-room-joined");
        socket.off("video-room-left");
        socket.off("message");
        clearInterval(metricsInterval);
      };
    }
  }, [socket, user, updateMetrics, refetch]);

  // Function to add new activity
  const addActivity = (
    type: string,
    description: string,
    icon: JSX.Element
  ) => {
    setRecentActivities((prev) => {
      const newActivity = {
        id: Date.now().toString(),
        type,
        description,
        timestamp: new Date().toISOString(),
        icon,
      };

      // Create new array with new activity at the start
      const updatedActivities = [
        newActivity,
        ...prev.slice(0, MAX_ACTIVITIES - 1),
      ];

      // Save to localStorage (without the icon JSX element)
      const forStorage = updatedActivities.map(({icon, ...rest}) => rest);
      localStorage.setItem("recentActivities", JSON.stringify(forStorage));

      return updatedActivities;
    });
  };

  // Initial metrics fetch
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  // Add cleanup function for old activities (optional)
  useEffect(() => {
    const cleanupOldActivities = () => {
      const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      setRecentActivities((prev) => {
        const now = new Date().getTime();
        const filtered = prev.filter((activity) => {
          const activityTime = new Date(activity.timestamp).getTime();
          return now - activityTime < ONE_DAY;
        });

        // Save filtered activities to localStorage
        const forStorage = filtered.map(({icon, ...rest}) => rest);
        localStorage.setItem("recentActivities", JSON.stringify(forStorage));

        return filtered;
      });
    };

    // Clean up old activities every hour
    const cleanup = setInterval(cleanupOldActivities, 60 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <Box
      sx={{display: "flex", minHeight: "100vh", bgcolor: "background.default"}}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: {
            xs: 0,
            sm: isMobile ? 0 : "240px",
          },
          width: {
            xs: "100%",
            sm: isMobile ? "100%" : "calc(100% - 240px)",
          },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Header */}
        <Header />

        {/* Main content area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: {xs: 2, sm: 3},
            height: "calc(100vh - 64px)", // Account for header height
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              mb: {xs: 2, sm: 4},
              fontWeight: "bold",
              color: "primary.main",
              borderBottom: "2px solid",
              borderColor: "primary.main",
              paddingBottom: 1,
              fontSize: {
                xs: "1.5rem",
                sm: "2rem",
                md: "2.125rem",
              },
            }}
          >
            Welcome back, {user?.fullName || "Guest"}!
          </Typography>

          <Grid container spacing={isMobile ? 2 : 3}>
            {[
              {
                title: "Total Users",
                icon: <FiUser />,
                value: metrics.totalUsers.toString(),
                change: "+5%",
                progress: 85,
              },
              {
                title: "Active Chats",
                icon: <FiMessageCircle />,
                value: chats.length.toString(),
                change: `+${((chats.length / metrics.totalUsers) * 100).toFixed(
                  1
                )}%`,
                progress: 65,
              },
              {
                title: "Video Rooms",
                icon: <FiVideo />,
                value: metrics.videoRooms.toString(),
                change: "+10%",
                progress: 45,
              },
            ].map((item) => (
              <Grid item xs={12} sm={isTablet ? 6 : 4} key={item.title}>
                <Card
                  elevation={3}
                  sx={{
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardHeader
                    title={
                      <Typography variant={isMobile ? "h6" : "h5"}>
                        {item.title}
                      </Typography>
                    }
                    action={
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: isMobile ? 40 : 48,
                          height: isMobile ? 40 : 48,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: "bold",
                        fontSize: {
                          xs: "1.5rem",
                          sm: "2rem",
                          md: "2.125rem",
                        },
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "success.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontSize: {
                          xs: "0.8rem",
                          sm: "0.875rem",
                        },
                      }}
                    >
                      <FiTrendingUp /> {item.change} from last period
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={item.progress}
                      sx={{mt: 2}}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card
            elevation={3}
            sx={{
              mt: {xs: 2, sm: 4},
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardHeader
              title={
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                  }}
                >
                  Recent Activity
                </Typography>
              }
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                p: {xs: 2, sm: 3},
              }}
            />
            <CardContent sx={{p: {xs: 1, sm: 2}}}>
              <List>
                {recentActivities.map((activity) => (
                  <Box key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: isMobile ? 32 : 40,
                            height: isMobile ? 32 : 40,
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant={isMobile ? "body1" : "h6"}
                            sx={{fontWeight: "bold"}}
                          >
                            {activity.type}
                          </Typography>
                        }
                        secondary={
                          <Typography variant={isMobile ? "body2" : "body1"}>
                            {activity.description}
                          </Typography>
                        }
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.75rem",
                          },
                        }}
                      >
                        {formatTimestamp(activity.timestamp)}
                      </Typography>
                    </ListItem>
                    {activity !==
                      recentActivities[recentActivities.length - 1] && (
                      <Divider />
                    )}
                  </Box>
                ))}
                {recentActivities.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No recent activities"
                      sx={{color: "text.secondary"}}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
