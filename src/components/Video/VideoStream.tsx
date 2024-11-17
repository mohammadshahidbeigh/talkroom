// client/src/components/Video/VideoStream.tsx
import {useEffect, useRef} from "react";
import {useSpring, animated} from "@react-spring/web";
import {startVideoStream} from "../../services/webrtc";

const VideoStream = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const fadeIn = useSpring({
    from: {opacity: 0},
    to: {opacity: 1},
    config: {duration: 1000},
  });

  useEffect(() => {
    const initializeStream = async () => {
      const stream = await startVideoStream();
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    };

    initializeStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <animated.div style={fadeIn}>
      <video ref={videoRef} autoPlay playsInline />
    </animated.div>
  );
};

export default VideoStream;
