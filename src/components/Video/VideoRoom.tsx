// client/src/components/Video/VideoRoom.tsx
import React, {useEffect, useRef} from "react";
import {startVideoStream} from "../../services/webrtc";

const VideoRoom = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const initializeVideo = async () => {
      const stream = await startVideoStream();
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    };
    initializeVideo();
  }, []);

  return <video ref={videoRef} autoPlay playsInline />;
};

export default VideoRoom;
