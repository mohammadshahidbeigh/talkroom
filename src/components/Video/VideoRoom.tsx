// client/src/components/Video/VideoRoom.tsx
import {useEffect, useRef, useState} from "react";
import {startVideoStream} from "../../services/webrtc";
import {
  Avatar,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  FiMic,
  FiVideo,
  FiPhoneOff,
  FiMessageSquare,
  FiUsers,
  FiMoreVertical,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import {Sidebar} from "../Layout";

const VideoRoom = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const initializeVideo = async () => {
      try {
        const stream = await startVideoStream();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing video stream:", error);
      }
    };
    initializeVideo();
  }, []);

  const participants = [
    {id: 1, name: "You", avatar: "/avatars/00.png", isSpeaking: true},
    {
      id: 2,
      name: "Alice Johnson",
      avatar: "/avatars/01.png",
      isSpeaking: false,
    },
    {id: 3, name: "Bob Smith", avatar: "/avatars/02.png", isSpeaking: false},
    {
      id: 4,
      name: "Carol Williams",
      avatar: "/avatars/03.png",
      isSpeaking: false,
    },
  ];
  return (
    <Box sx={{display: "flex", height: "100vh", overflow: "hidden"}}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: "240px",
          display: "flex",
          flexDirection: "column",
          bgcolor: "grey.900",
          position: "relative",
          color: "white",
        }}
      >
        <Container maxWidth="xl" sx={{flexGrow: 1, py: 3, px: {xs: 2, sm: 3}}}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
              mb: 3,
            }}
          >
            {participants.map((participant) => (
              <Paper
                key={participant.id}
                elevation={4}
                sx={{
                  bgcolor: "grey.800",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              >
                <Box sx={{position: "relative", pt: "56.25%"}}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(to bottom, #1a1a1a, #2d2d2d)",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        border: 3,
                        borderColor: "primary.main",
                      }}
                      src={participant.avatar}
                      alt={participant.name}
                    >
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      right: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Paper
                      sx={{
                        bgcolor: "rgba(0,0,0,0.6)",
                        px: 2,
                        py: 0.75,
                        borderRadius: 2,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{color: "white"}}>
                        {participant.name}
                      </Typography>
                    </Paper>
                    {participant.isSpeaking && (
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          boxShadow: "0 0 10px #4caf50",
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
          <Paper
            elevation={4}
            sx={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "grey.800",
              borderRadius: 8,
              px: 4,
              py: 2,
              display: "flex",
              gap: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            {[
              {icon: <FiMic />, color: "primary"},
              {icon: <FiVideo />, color: "primary"},
              {icon: <FiPhoneOff />, color: "error"},
              {icon: <FiMessageSquare />, color: "primary"},
              {
                icon: <FiUsers />,
                color: "primary",
                onClick: () => setShowParticipants(!showParticipants),
              },
              {
                icon: <FiMoreVertical />,
                color: "primary",
                onClick: handleClick,
              },
            ].map((btn, index) => (
              <Button
                key={index}
                variant={btn.color === "error" ? "contained" : "outlined"}
                color={btn.color as "primary" | "error"}
                onClick={btn.onClick}
                sx={{
                  borderRadius: "50%",
                  minWidth: 48,
                  height: 48,
                  p: 0,
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                  transition: "transform 0.2s",
                  color: "white",
                }}
              >
                {btn.icon}
              </Button>
            ))}
          </Paper>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            sx={{
              "& .MuiMenuItem-root": {
                fontSize: "0.775rem",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setShowParticipants(true);
                handleClose();
              }}
            >
              View Participants
            </MenuItem>
          </Menu>
        </Container>
        <Paper
          elevation={4}
          sx={{
            width: 300,
            bgcolor: "grey.800",
            borderLeft: 1,
            borderColor: "grey.700",
            height: "100%",
            position: "fixed",
            right: showParticipants ? 0 : -300,
            top: 0,
            overflowY: "auto",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.2)",
            color: "white",
            transition: "right 0.3s ease-in-out",
          }}
        >
          <IconButton
            onClick={() => setShowParticipants(false)}
            sx={{
              position: "absolute",
              left: -48,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "grey.800",
              color: "white",
              "&:hover": {
                bgcolor: "grey.700",
              },
              display: showParticipants ? "flex" : "none",
            }}
          >
            <FiChevronRight />
          </IconButton>
          <Box sx={{p: 3, borderBottom: 1, borderColor: "grey.700", position: "relative"}}>
            <Typography
              variant="h6"
              sx={{fontWeight: "medium", color: "white"}}
            >
              Participants ({participants.length})
            </Typography>
            <IconButton
              onClick={() => setShowParticipants(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                "&:hover": {
                  bgcolor: "grey.700",
                },
              }}
            >
              <FiX />
            </IconButton>
          </Box>
          <Box>
            {participants.map((participant) => (
              <Box
                key={participant.id}
                sx={{
                  p: 2,
                  transition: "background-color 0.2s",
                  "&:hover": {bgcolor: "grey.700"},
                }}
              >
                <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                  <Avatar
                    src={participant.avatar}
                    alt={participant.name}
                    sx={{border: 2, borderColor: "primary.main"}}
                  >
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar>
                  <Box sx={{flexGrow: 1}}>
                    <Typography
                      variant="body2"
                      sx={{fontWeight: "medium", color: "white"}}
                    >
                      {participant.name}
                    </Typography>
                  </Box>
                  <Box sx={{display: "flex", gap: 1}}>
                    <FiMic size={16} color="#4caf50" />
                    <FiVideo size={16} color="#4caf50" />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default VideoRoom;
