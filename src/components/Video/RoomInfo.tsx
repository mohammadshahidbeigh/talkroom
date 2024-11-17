import React, {useState} from "react";
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Snackbar,
  Paper,
} from "@mui/material";
import {FiCopy, FiShare2} from "react-icons/fi";

interface RoomInfoProps {
  roomId: string;
}

const RoomInfo: React.FC<RoomInfoProps> = ({roomId}) => {
  const [showCopied, setShowCopied] = useState(false);

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
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Typography variant="body2" color="white">
        Room ID: {roomId}
      </Typography>
      <Box sx={{display: "flex", gap: 1}}>
        <Tooltip title="Copy Room ID">
          <IconButton size="small" onClick={handleCopyRoomId} color="inherit">
            <FiCopy />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share Room">
          <IconButton size="small" onClick={handleShare} color="inherit">
            <FiShare2 />
          </IconButton>
        </Tooltip>
      </Box>
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="Room ID copied to clipboard"
        anchorOrigin={{vertical: "top", horizontal: "center"}}
      />
    </Paper>
  );
};

export default RoomInfo;
