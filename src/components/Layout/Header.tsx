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
} from "@mui/material";
import {FiBell, FiSettings, FiUser, FiLogOut} from "react-icons/fi";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {logout} from "../../store/slices/authSlice";
import useAppSelector from "../../hooks/useAppSelector";

interface User {
  name?: string;
  avatar?: string;
}

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user) as User;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        px: 3,
        py: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 0,
      }}
    >
      <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Dashboard
        </Typography>
      </Box>

      <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
        <Tooltip title="Notifications">
          <IconButton
            sx={{
              "&:hover": {color: theme.palette.primary.main},
              transition: "color 0.2s",
            }}
          >
            <Badge badgeContent={4} color="error">
              <FiBell />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings">
          <IconButton
            onClick={() => navigate("/profile")}
            sx={{
              "&:hover": {color: theme.palette.primary.main},
              transition: "color 0.2s",
            }}
          >
            <FiSettings />
          </IconButton>
        </Tooltip>

        <Tooltip title="Profile">
          <Avatar
            src={user?.avatar}
            alt={user?.name || "User"}
            sx={{
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
              },
              bgcolor: theme.palette.primary.main,
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
              minWidth: 180,
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
