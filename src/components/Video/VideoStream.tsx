// client/src/components/Video/VideoStream.tsx
import React, {useEffect, useRef, useState} from "react";
import {Box, Typography, IconButton} from "@mui/material";
import {styled} from "@mui/system";
import {
  FiMicOff,
  FiVideoOff,
  FiMaximize,
  FiMinimize,
  FiBookmark,
  FiX,
} from "react-icons/fi";

interface VideoStreamProps {
  stream: MediaStream;
  isMuted?: boolean;
  isLocal?: boolean;
  username?: string;
  isPinned?: boolean;
  onPinStream?: () => void;
}

const StyledVideo = styled("video")(() => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
  top: 0,
  left: 0,
  transition: "all 0.3s ease",
  backgroundColor: "#000",
}));

const VideoOverlay = styled(Box)(({theme}) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1.5, 2),
  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  transition: "opacity 0.3s ease",
  opacity: 1,
  zIndex: 2,
}));

const ControlsOverlay = styled(Box)(({theme}) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  display: "flex",
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: "opacity 0.3s ease",
  "& button": {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
  },
}));

const VideoContainer = styled(Box)({
  "&:hover": {
    "& .controls-overlay": {
      opacity: 1,
    },
  },
});

const VideoStream: React.FC<VideoStreamProps> = ({
  stream,
  isMuted = false,
  isLocal = false,
  username = "User",
  isPinned = false,
  onPinStream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playAttempts = useRef(0);

  const playVideo = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    try {
      await videoElement.play();
      playAttempts.current = 0; // Reset attempts on successful play
    } catch (err) {
      console.error("Error playing video:", err);

      // Retry logic for AbortError
      if (err instanceof Error && err.name === "AbortError") {
        if (playAttempts.current < 3) {
          // Limit retry attempts
          playAttempts.current += 1;
          setTimeout(() => {
            playVideo();
          }, 1000); // Wait 1 second before retrying
        }
      }
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;

      // Add event listeners for better playback handling
      const handleLoadedMetadata = () => {
        playVideo();
      };

      const handlePause = () => {
        // Auto-resume if paused unexpectedly
        if (!videoElement.ended) {
          playVideo();
        }
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("pause", handlePause);

      const updateTrackStates = () => {
        setHasAudio(stream.getAudioTracks().some((track) => track.enabled));
        setHasVideo(stream.getVideoTracks().some((track) => track.enabled));
      };

      stream.getTracks().forEach((track) => {
        track.onended = updateTrackStates;
        track.onmute = updateTrackStates;
        track.onunmute = updateTrackStates;
      });

      updateTrackStates();

      return () => {
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        videoElement.removeEventListener("pause", handlePause);
        if (videoElement.srcObject) {
          videoElement.srcObject = null;
        }
      };
    }
  }, [stream]);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <VideoContainer
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <StyledVideo
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted || isLocal}
        style={{
          transform: isLocal ? "scaleX(-1)" : "none",
          filter: !hasVideo ? "blur(10px) brightness(0.5)" : "none",
          objectFit: isPinned ? "contain" : "cover",
        }}
      />

      {!hasVideo && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            color: "white",
            zIndex: 1,
          }}
        >
          <FiVideoOff size={40} />
          <Typography variant="body2">Video Off</Typography>
        </Box>
      )}

      <ControlsOverlay className="controls-overlay">
        <IconButton size="small" onClick={onPinStream}>
          {isPinned ? <FiX /> : <FiBookmark />}
        </IconButton>
        <IconButton size="small" onClick={toggleFullscreen}>
          {isFullscreen ? <FiMinimize /> : <FiMaximize />}
        </IconButton>
      </ControlsOverlay>

      <VideoOverlay>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {username}
          {isLocal && (
            <Typography
              component="span"
              variant="caption"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
              }}
            >
              You
            </Typography>
          )}
        </Typography>
        <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
          {!hasAudio && (
            <Box
              sx={{
                bgcolor: "error.main",
                color: "white",
                p: 0.5,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiMicOff size={16} />
            </Box>
          )}
          {!hasVideo && (
            <Box
              sx={{
                bgcolor: "error.main",
                color: "white",
                p: 0.5,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiVideoOff size={16} />
            </Box>
          )}
        </Box>
      </VideoOverlay>
    </VideoContainer>
  );
};

export default VideoStream;
