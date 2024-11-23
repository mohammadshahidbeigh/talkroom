// client/src/components/Layout/Sidebar.tsx
import {Link, useLocation, useNavigate} from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  Snackbar,
  Alert,
  useMediaQuery,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  FiBarChart,
  FiMessageCircle,
  FiUser,
  FiVideo,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/authSlice";
import {useState} from "react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleLogout = () => {
    try {
      dispatch(logout());
      setNotification({
        open: true,
        message: "Logged out successfully",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setNotification({
        open: true,
        message: "Failed to logout. Please try again.",
        severity: "error",
      });
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarContent = (
    <>
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          ml: {xs: 4, sm: 1},
        }}
      >
        <img
          src="/logo.png"
          alt="App Logo"
          style={{width: isMobile ? "32px" : "40px", height: "auto"}}
        />
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
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
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <Button
              startIcon={item.icon}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                px: 3,
                py: isMobile ? 1 : 1.5,
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
        sx={{
          p: 2,
          mt: "auto",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          fullWidth
          startIcon={<FiLogOut />}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            px: 3,
            py: isMobile ? 1 : 1.5,
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
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            left: 16,
            top: 16,
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          <FiMenu />
        </IconButton>
      )}

      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: 240,
              bgcolor: "background.paper",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Paper
          elevation={3}
          sx={{
            width: isTablet ? 200 : 240,
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
          {sidebarContent}
        </Paper>
      )}

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
    </>
  );
};

export default Sidebar;
