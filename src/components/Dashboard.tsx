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

const Dashboard = () => {
  const user = useAppSelector((state) => state.auth.user);

  const recentActivities = [
    {
      type: "New User",
      description: "John Doe joined the platform",
      time: "2 minutes ago",
      icon: <FiUser />,
    },
    {
      type: "Video Call",
      description: "Team meeting completed",
      time: "1 hour ago",
      icon: <FiVideo />,
    },
    {
      type: "Chat",
      description: "New group chat created",
      time: "3 hours ago",
      icon: <FiMessageCircle />,
    },
  ];

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
                value: "1,234",
                change: "+20.1%",
                progress: 85,
              },
              {
                title: "Active Chats",
                icon: <FiMessageCircle />,
                value: "42",
                change: "+15%",
                progress: 65,
              },
              {
                title: "Video Calls",
                icon: <FiVideo />,
                value: "8",
                change: "+7%",
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
                {recentActivities.map((activity, index) => (
                  <>
                    <ListItem key={index}>
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
                        {activity.time}
                      </Typography>
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
