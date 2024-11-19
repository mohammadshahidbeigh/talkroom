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

const Dashboard = () => {
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
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

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
      return [newActivity, ...prev.slice(0, 4)];
    });
  };

  // Initial metrics fetch
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

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
          marginLeft: "240px", // Match sidebar width
          width: "calc(100% - 240px)", // Adjust width accounting for sidebar
        }}
      >
        {/* Header */}
        <Header />

        {/* Main content area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 3,
            height: "calc(100vh - 64px)", // Account for header height
            backgroundColor: "#f5f5f5",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: "bold",
              color: "primary.main",
              borderBottom: "2px solid",
              borderColor: "primary.main",
              paddingBottom: 1,
            }}
          >
            Welcome back, {user?.fullName || "Guest"}!
          </Typography>

          <Grid container spacing={3}>
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
              <Grid item xs={12} sm={6} md={4} key={item.title}>
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
                    title={item.title}
                    action={
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 48,
                          height: 48,
                        }}
                      >
                        {item.icon}
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Typography variant="h4" sx={{fontWeight: "bold"}}>
                      {item.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "success.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
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
              mt: 4,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardHeader
              title="Recent Activity"
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                "& .MuiTypography-root": {
                  fontWeight: "bold",
                  color: "primary.main",
                },
              }}
            />
            <CardContent>
              <List>
                {recentActivities.map((activity) => (
                  <Box key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{bgcolor: "primary.main"}}>
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.type}
                        secondary={activity.description}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: "bold",
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
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
