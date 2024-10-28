// client/src/components/Dashboard.tsx
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import {FiUser, FiMessageCircle, FiVideo} from "react-icons/fi";
import {Header, Sidebar} from "./Layout";
import useAppSelector from "../hooks/useAppSelector";

const Dashboard = () => {
  const user = useAppSelector((state) => state.auth.user);

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
          }}
        >
          <Typography variant="h4" sx={{mb: 4, fontWeight: "bold"}}>
            Welcome back, {user?.name || "Guest"}!
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                title: "Total Users",
                icon: <FiUser />,
                value: "1,234",
                change: "+20.1%",
              },
              {
                title: "Active Chats",
                icon: <FiMessageCircle />,
                value: "42",
                change: "+15%",
              },
              {
                title: "Video Calls",
                icon: <FiVideo />,
                value: "8",
                change: "+7%",
              },
            ].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.title}>
                <Card elevation={3}>
                  <CardHeader
                    title={item.title}
                    action={
                      <Avatar sx={{bgcolor: "primary.main"}}>
                        {item.icon}
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Typography variant="h4" sx={{fontWeight: "bold"}}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {item.change} from last period
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card elevation={3} sx={{mt: 4}}>
            <CardHeader title="Recent Activity" />
            <CardContent>
              <Typography variant="body1">
                Activity feed will be displayed here with more detailed
                information and possibly a chart or graph.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
