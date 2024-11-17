// client/src/components/Video/VideoStream.tsx
import React, {useEffect, useRef} from "react";
import {Box} from "@mui/material";
import {styled} from "@mui/system";

interface VideoStreamProps {
  stream: MediaStream;
  isMuted?: boolean;
  isLocal?: boolean;
  username?: string;
}

const StyledVideo = styled("video")(({theme}) => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: theme.spacing(1),
}));

const VideoOverlay = styled(Box)(({theme}) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  padding: theme.spacing(0.5, 1),
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  borderRadius: theme.spacing(0.5),
  color: "white",
  fontSize: "0.875rem",
}));

const VideoStream: React.FC<VideoStreamProps> = ({
  stream,
  isMuted = false,
  isLocal = false,
  username = "User",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <Box sx={{position: "relative", width: "100%", height: "100%"}}>
      <StyledVideo
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted || isLocal}
        style={{transform: isLocal ? "scaleX(-1)" : "none"}}
      />
      <VideoOverlay>
        {username} {isLocal && "(You)"}
      </VideoOverlay>
    </Box>
  );
};

export default VideoStream;
