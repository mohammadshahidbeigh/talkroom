// client/src/components/Layout/Sidebar.tsx
import {Link} from "react-router-dom";
import {Box, Button, Paper, Avatar} from "@mui/material";
import {
  FiBarChart,
  FiMessageCircle,
  FiUser,
  FiVideo,
  FiLogOut,
} from "react-icons/fi";
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/authSlice";
import {useSelector} from "react-redux";
import {RootState} from "../../store";

const Sidebar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

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
      }}
    >
      <Box sx={{p: 3, display: "flex", justifyContent: "flex-start"}}>
        <img
          src="/public/logo.png"
          alt="App Logo"
          style={{width: "60px", height: "auto"}}
        />
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
                "&:hover": {bgcolor: "action.hover"},
              }}
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </Box>

      <Box sx={{p: 2, mt: "auto"}}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={
            <Avatar src="/avatars/01.png" sx={{width: 24, height: 24}} />
          }
          endIcon={<FiLogOut />}
          onClick={() => dispatch(logout())}
        >
          {user?.name || "User"}
        </Button>
      </Box>
    </Paper>
  );
};

export default Sidebar;
