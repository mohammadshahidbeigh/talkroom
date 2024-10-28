// client/src/components/Layout/Sidebar.tsx
import {Link, useLocation} from "react-router-dom";
import {Box, Button, Paper, Typography, useTheme} from "@mui/material";
import {
  FiBarChart,
  FiMessageCircle,
  FiUser,
  FiVideo,
  FiLogOut,
} from "react-icons/fi";
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const location = useLocation();

  return (
    <Paper
      elevation={3}
      sx={{
        width: 240,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "all 0.3s ease",
      }}
    >
      <Box sx={{p: 3, display: "flex", alignItems: "center", gap: 2}}>
        <img
          src="/public/logo.png"
          alt="App Logo"
          style={{width: "40px", height: "auto"}}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TalkRoom
        </Typography>
      </Box>
      <Box component="nav" sx={{mt: 2, flexGrow: 1}}>
        {[
          {icon: <FiBarChart />, label: "Dashboard", to: "/dashboard"},
          {icon: <FiMessageCircle />, label: "Chat", to: "/chat"},
          {icon: <FiVideo />, label: "Video Room", to: "/video"},
          {icon: <FiUser />, label: "Profile", to: "/profile"},
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            style={{textDecoration: "none", color: "inherit"}}
          >
            <Button
              startIcon={item.icon}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                px: 3,
                py: 1.5,
                borderRadius: 0,
                position: "relative",
                color:
                  location.pathname === item.to ? "primary.main" : "inherit",
                "&:hover": {
                  bgcolor: "action.hover",
                  color: "primary.main",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "3px",
                  bgcolor: "primary.main",
                  opacity: location.pathname === item.to ? 1 : 0,
                  transition: "opacity 0.2s",
                },
                transition: "all 0.2s",
              }}
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </Box>

      <Box
        sx={{p: 2, mt: "auto", borderTop: "1px solid", borderColor: "divider"}}
      >
        <Button
          fullWidth
          startIcon={<FiLogOut />}
          onClick={() => dispatch(logout())}
          sx={{
            justifyContent: "flex-start",
            px: 3,
            py: 1.5,
            borderRadius: 1,
            color: "error.main",
            "&:hover": {
              bgcolor: "error.light",
              color: "error.dark",
            },
            transition: "all 0.2s",
          }}
        >
          Logout
        </Button>
      </Box>
    </Paper>
  );
};

export default Sidebar;
