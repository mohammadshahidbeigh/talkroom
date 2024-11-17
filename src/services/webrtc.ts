// client/src/services/webrtc.ts
import {Socket} from "socket.io-client";

interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream: MediaStream;
}

const peerConnections = new Map<string, PeerConnection>();
const configuration = {
  iceServers: [
    {urls: "stun:stun.l.google.com:19302"},
    {urls: "stun:stun1.l.google.com:19302"},
  ],
};

export const startVideoStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (error) {
    console.error("Failed to access media devices:", error);
    throw error;
  }
};

export const handlePeerConnection = async (
  socket: Socket,
  localStream: MediaStream,
  remoteUserId: string,
  roomId: string,
  onRemoteStream: (stream: MediaStream, userId: string) => void
) => {
  // Check if connection already exists
  const existingPeer = peerConnections.get(remoteUserId);
  if (existingPeer) {
    console.log("Using existing peer connection for:", remoteUserId);
    return existingPeer.connection;
  }

  console.log("Creating new peer connection for:", remoteUserId);
  const peerConnection = new RTCPeerConnection(configuration);

  // Add local tracks to the connection
  localStream.getTracks().forEach((track) => {
    console.log("Adding local track:", track.kind);
    peerConnection.addTrack(track, localStream);
  });

  // Create a new MediaStream for remote tracks
  const remoteStream = new MediaStream();
  let tracksAdded = false;

  // Handle incoming tracks
  peerConnection.ontrack = (event) => {
    console.log("Received remote track:", event.track.kind);
    event.streams[0].getTracks().forEach((track) => {
      console.log("Adding track to remote stream:", track.kind);
      remoteStream.addTrack(track);
    });

    // Only call onRemoteStream once per connection
    if (!tracksAdded) {
      tracksAdded = true;
      console.log("Calling onRemoteStream for:", remoteUserId);
      onRemoteStream(remoteStream, remoteUserId);
    }
  };

  // Handle negotiation needed
  peerConnection.onnegotiationneeded = async () => {
    console.log("Negotiation needed for:", remoteUserId);
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", {offer, remoteUserId, roomId});
    } catch (error) {
      console.error("Error during negotiation:", error);
    }
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate to:", remoteUserId);
      socket.emit("ice-candidate", {
        candidate: event.candidate,
        remoteUserId,
        roomId,
      });
    }
  };

  // Log connection state changes
  peerConnection.onconnectionstatechange = () => {
    console.log(
      `Connection state changed for ${remoteUserId}:`,
      peerConnection.connectionState
    );
    if (peerConnection.connectionState === "failed") {
      console.log("Attempting to restart ICE");
      peerConnection.restartIce();
    }
  };

  // Log ICE connection state changes
  peerConnection.oniceconnectionstatechange = () => {
    console.log(
      `ICE connection state changed for ${remoteUserId}:`,
      peerConnection.iceConnectionState
    );
  };

  // Store the peer connection
  peerConnections.set(remoteUserId, {
    userId: remoteUserId,
    connection: peerConnection,
    stream: localStream,
  });

  return peerConnection;
};

export const createAndSendOffer = async (
  socket: Socket,
  peerConnection: RTCPeerConnection,
  remoteUserId: string,
  roomId: string
) => {
  try {
    // Check if we can create an offer
    if (peerConnection.signalingState !== "stable") {
      console.log("Connection not stable, waiting...");
      return;
    }

    console.log("Creating offer");
    const offer = await peerConnection.createOffer();

    console.log("Setting local description");
    await peerConnection.setLocalDescription(offer);

    console.log("Sending offer");
    socket.emit("offer", {offer, remoteUserId, roomId});
  } catch (error) {
    console.error("Error creating offer:", error);
  }
};

export const handleReceivedOffer = async (
  socket: Socket,
  peerConnection: RTCPeerConnection,
  offer: RTCSessionDescriptionInit,
  remoteUserId: string,
  roomId: string
) => {
  try {
    // Check if we can set remote description
    if (peerConnection.signalingState !== "stable") {
      console.log("Resetting connection state");
      await peerConnection.setLocalDescription({type: "rollback"});
    }

    console.log("Setting remote description from offer");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    console.log("Creating answer");
    const answer = await peerConnection.createAnswer();

    console.log("Setting local description");
    await peerConnection.setLocalDescription(answer);

    console.log("Sending answer");
    socket.emit("answer", {answer, remoteUserId, roomId});
  } catch (error) {
    console.error("Error handling offer:", error);
  }
};

export const handleReceivedAnswer = async (
  peerConnection: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
) => {
  try {
    // Check connection state before setting remote description
    if (peerConnection.signalingState === "stable") {
      console.log("Connection already stable, ignoring answer");
      return;
    }

    if (peerConnection.signalingState === "have-local-offer") {
      console.log("Setting remote description from answer");
      const remoteDesc = new RTCSessionDescription(answer);
      await peerConnection.setRemoteDescription(remoteDesc);
    } else {
      console.log(
        "Invalid signaling state for setting remote answer:",
        peerConnection.signalingState
      );
    }
  } catch (error) {
    console.error("Error handling answer:", error);
  }
};

export const handleIceCandidate = async (
  peerConnection: RTCPeerConnection,
  candidate: RTCIceCandidateInit
) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
};

// Screen sharing
export const startScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (error) {
    console.error("Error starting screen share:", error);
    throw error;
  }
};

// Utility functions
export const toggleAudio = (stream: MediaStream) => {
  const audioTrack = stream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    return audioTrack.enabled;
  }
  return false;
};

export const toggleVideo = (stream: MediaStream) => {
  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    return videoTrack.enabled;
  }
  return false;
};

export const cleanupPeerConnections = () => {
  peerConnections.forEach((peer) => {
    peer.connection.close();
  });
  peerConnections.clear();
};

export const getPeerConnection = (userId: string) => {
  return peerConnections.get(userId);
};

export {peerConnections};
