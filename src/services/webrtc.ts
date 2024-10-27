// client/src/services/webrtc.ts
export const startVideoStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (error) {
    console.error("Failed to access media devices:", error);
    return null;
  }
};
