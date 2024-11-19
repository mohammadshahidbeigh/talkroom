import React, {useState} from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import {FiVideo, FiLogIn, FiUsers} from "react-icons/fi";

interface VideoRoomFormProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

const VideoRoomForm: React.FC<VideoRoomFormProps> = ({
  onCreateRoom,
  onJoinRoom,
}) => {
  const [roomId, setRoomId] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: isSmallScreen ? 1 : 2,
        background: `linear-gradient(45deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: isSmallScreen ? 2 : 4,
          maxWidth: isSmallScreen ? "90vw" : 400,
          width: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{mb: 4, textAlign: "center"}}>
          <FiUsers
            size={isSmallScreen ? 30 : 40}
            color={theme.palette.primary.main}
          />
          <Typography
            variant="h5"
            sx={{
              mt: 2,
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Video Room
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={onCreateRoom}
          startIcon={<FiVideo />}
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            boxShadow: theme.shadows[4],
            "&:hover": {
              boxShadow: theme.shadows[8],
            },
          }}
        >
          Create New Room
        </Button>

        <Divider sx={{my: 3}}>
          <Typography variant="body2" sx={{color: "text.secondary", px: 1}}>
            OR
          </Typography>
        </Divider>

        <form onSubmit={handleJoinRoom}>
          <TextField
            fullWidth
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Enter room ID to join"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="outlined"
            color="primary"
            size="large"
            disabled={!roomId.trim()}
            startIcon={<FiLogIn />}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Join Room
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default VideoRoomForm;
