import React, {useState} from "react";
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Snackbar,
  Paper,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import {FiCopy, FiShare2, FiInfo} from "react-icons/fi";

interface RoomInfoProps {
  roomId: string;
}

const RoomInfo: React.FC<RoomInfoProps> = ({roomId}) => {
  const [showCopied, setShowCopied] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setShowCopied(true);
    } catch (err) {
      console.error("Failed to copy room ID:", err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Join my video room",
      text: `Join my video room with ID: ${roomId}`,
      url: `${window.location.origin}/video/${roomId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyRoomId();
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: isSmallScreen ? 1 : 2,
        p: isSmallScreen ? 1 : 1.5,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
        flexDirection: isSmallScreen ? "column" : "row",
      }}
    >
      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
        <FiInfo size={20} color={theme.palette.primary.main} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "text.primary",
            textAlign: isSmallScreen ? "center" : "left",
            fontSize: isSmallScreen ? "0.75rem" : "inherit",
          }}
        >
          Room ID: {roomId}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          justifyContent: isSmallScreen ? "center" : "flex-start",
        }}
      >
        <Tooltip title="Copy Room ID" arrow>
          <IconButton
            size="small"
            onClick={handleCopyRoomId}
            sx={{
              color: "primary.main",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <FiCopy size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share Room" arrow>
          <IconButton
            size="small"
            onClick={handleShare}
            sx={{
              color: "primary.main",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <FiShare2 size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="Room ID copied to clipboard"
        anchorOrigin={{vertical: "top", horizontal: "center"}}
        sx={{
          "& .MuiSnackbarContent-root": {
            bgcolor: theme.palette.primary.main,
            color: "white",
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          },
        }}
      />
    </Paper>
  );
};

export default RoomInfo;
