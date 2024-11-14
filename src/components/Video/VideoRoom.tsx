// client/src/components/Video/VideoRoom.tsx
import {useEffect, useRef, useState} from "react";
import {useSocket} from "../../contexts/SocketContext";
import {videoApi} from "../../services/api";
import {startVideoStream} from "../../services/webrtc";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";
import {Sidebar} from "../Layout";

const VideoRoom = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, RTCPeerConnection>>({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize room and local stream
  useEffect(() => {
    let mounted = true;

    const initializeRoom = async () => {
      try {
        // Get local stream
        const stream = await startVideoStream();
        if (!mounted) return;

        if (stream && localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          setLocalStream(stream);
          setIsLoading(false);
        }

        // Create room via API
        const {data: room} = await videoApi.createRoom();
        if (!mounted) return;

        // Join room via socket
        socket?.emit("join-video-room", {roomId: room.id});
      } catch (error) {
        console.error("Failed to initialize video room:", error);
        setIsLoading(false);
      }
    };

    initializeRoom();

    return () => {
      mounted = false;
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      Object.values(peers).forEach((peer) => peer.close());
    };
  }, [socket, localStream, peers]); // Added missing dependencies

  // Handle peer connections
  useEffect(() => {
    if (!socket || !localStream) return;

    const handleUserJoined = async ({userId}: {userId: string}) => {
      const peerConnection = new RTCPeerConnection();

      // Add local tracks
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("video-offer", {userId, offer});

      setPeers((prev) => ({...prev, [userId]: peerConnection}));
    };

    const handleVideoOffer = async ({
      userId,
      offer,
    }: {
      userId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const peerConnection = peers[userId] || new RTCPeerConnection();

      // Add local tracks if not already added
      if (!peers[userId]) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("video-answer", {userId, answer});

      setPeers((prev) => ({...prev, [userId]: peerConnection}));
    };

    const handleVideoAnswer = async ({
      userId,
      answer,
    }: {
      userId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      const peerConnection = peers[userId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    };

    const handleUserLeft = ({userId}: {userId: string}) => {
      const peerConnection = peers[userId];
      if (peerConnection) {
        peerConnection.close();
        setPeers((prev) => {
          const newPeers = {...prev};
          delete newPeers[userId];
          return newPeers;
        });
      }
    };

    // Set up event listeners
    socket.on("user-joined", handleUserJoined);
    socket.on("video-offer", handleVideoOffer);
    socket.on("video-answer", handleVideoAnswer);
    socket.on("user-left", handleUserLeft);

    return () => {
      // Clean up event listeners
      socket.off("user-joined", handleUserJoined);
      socket.off("video-offer", handleVideoOffer);
      socket.off("video-answer", handleVideoAnswer);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket, localStream, peers]); // Include all dependencies

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = () => {
    // Implement call ending logic
    localStream?.getTracks().forEach((track) => track.stop());
    Object.values(peers).forEach((peer) => peer.close());
    // Navigate back or close room
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Sidebar />
      <Box
        ref={containerRef}
        sx={{
          flexGrow: 1,
          marginLeft: "240px",
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" sx={{mb: 3}}>
          Video Room
        </Typography>

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Local video */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  position: "relative",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                  borderRadius: 2,
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Typography
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    color: "white",
                    bgcolor: "rgba(0,0,0,0.5)",
                    px: 1,
                    borderRadius: 1,
                  }}
                >
                  You
                </Typography>
              </Paper>
            </Grid>

            {/* Remote videos will be added here */}
          </Grid>
        )}

        {/* Control bar */}
        <Paper
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            px: 3,
            py: 2,
            borderRadius: 8,
            display: "flex",
            gap: 2,
            bgcolor: "background.paper",
            boxShadow: 3,
          }}
        >
          <Tooltip title={isAudioEnabled ? "Mute" : "Unmute"}>
            <IconButton
              onClick={toggleAudio}
              color={isAudioEnabled ? "primary" : "error"}
            >
              {isAudioEnabled ? <FiMic /> : <FiMicOff />}
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            <IconButton
              onClick={toggleVideo}
              color={isVideoEnabled ? "primary" : "error"}
            >
              {isVideoEnabled ? <FiVideo /> : <FiVideoOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title="End call">
            <IconButton onClick={handleEndCall} color="error">
              <FiPhoneOff />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>
    </Box>
  );
};

export default VideoRoom;
