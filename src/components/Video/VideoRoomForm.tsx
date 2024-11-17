import React, {useState} from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import {FiVideo, FiLogIn} from "react-icons/fi";

interface VideoRoomFormProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}

const VideoRoomForm: React.FC<VideoRoomFormProps> = ({
  onCreateRoom,
  onJoinRoom,
}) => {
  const [roomId, setRoomId] = useState("");

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
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          Video Room
        </Typography>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={onCreateRoom}
          startIcon={<FiVideo />}
          sx={{mb: 3}}
        >
          Create New Room
        </Button>

        <Divider sx={{my: 3}}>OR</Divider>

        <form onSubmit={handleJoinRoom}>
          <TextField
            fullWidth
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            margin="normal"
            variant="outlined"
            placeholder="Enter room ID to join"
          />
          <Button
            fullWidth
            type="submit"
            variant="outlined"
            color="primary"
            size="large"
            disabled={!roomId.trim()}
            startIcon={<FiLogIn />}
            sx={{mt: 2}}
          >
            Join Room
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default VideoRoomForm;
