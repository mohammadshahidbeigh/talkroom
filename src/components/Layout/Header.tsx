import {useNavigate} from "react-router-dom";

import {
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Box,
  Badge,
} from "@mui/material";
import {FiBell, FiSettings} from "react-icons/fi";

const Header = () => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={2}
      sx={{
        py: 2,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        right: 0,
        left: 240, // Match sidebar width
        zIndex: 1100,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h5" sx={{fontWeight: "medium"}}>
        Dashboard
      </Typography>
      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
        <Tooltip title="Notifications">
          <IconButton>
            <Badge badgeContent={4} color="error">
              <FiBell />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={() => navigate("/profile")}>
            <FiSettings />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default Header;
