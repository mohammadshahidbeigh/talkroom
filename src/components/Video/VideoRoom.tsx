// client/src/components/Video/VideoRoom.tsx
import React, {useEffect, useState, useCallback, useRef} from "react";
import useSocket from "../../hooks/useSocket";
import useAppSelector from "../../hooks/useAppSelector";
import type {RootState} from "../../store";
import {
  startVideoStream,
  handlePeerConnection,
  createAndSendOffer,
  handleReceivedOffer,
  handleReceivedAnswer,
  handleIceCandidate,
  startScreenShare,
  toggleAudio,
  toggleVideo,
  cleanupPeerConnections,
  getPeerConnection,
  peerConnections,
} from "../../services/webrtc";
import VideoStream from "./VideoStream";
import {Box, IconButton, Grid, Paper, Badge, Drawer} from "@mui/material";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiMonitor,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import VideoRoomForm from "./VideoRoomForm";
import RoomInfo from "./RoomInfo";
import VideoChatPanel from "./VideoChatPanel";
import ParticipantsList from "./ParticipantsList";
import {useNavigate, useParams} from "react-router-dom";

interface Participant {
  userId: string;
  username: string;
  stream: MediaStream;
}

interface PeerConnectionWithStream {
  connection: RTCPeerConnection;
  stream: MediaStream;
}

const VideoRoom: React.FC = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const {roomId} = useParams<{roomId: string}>();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isInRoom, setIsInRoom] = useState(false);
  const hasJoinedRoom = useRef(false);
  const cleanupRef = useRef(() => {});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const screenShareStream = useRef<MediaStream | null>(null);

  const handleCreateRoom = useCallback(() => {
    const newRoomId = "room-" + Date.now();
    navigate(`/video/${newRoomId}`);
  }, [navigate]);

  const handleJoinRoom = useCallback(
    (roomId: string) => {
      navigate(`/video/${roomId}`);
    },
    [navigate]
  );

  const initializeMedia = useCallback(async () => {
    if (!roomId || !user || hasJoinedRoom.current) return;

    try {
      const stream = await startVideoStream();
      setLocalStream(stream);
      socket.emit("join-room", roomId);
      hasJoinedRoom.current = true;
      setIsInRoom(true);

      // Store cleanup function
      cleanupRef.current = () => {
        stream.getTracks().forEach((track) => track.stop());
        socket.emit("leave-room", roomId);
        hasJoinedRoom.current = false;
        cleanupPeerConnections();
      };
    } catch (error) {
      console.error("Failed to initialize media:", error);
    }
  }, [user, socket, roomId]);

  const handleLeaveRoom = useCallback(() => {
    cleanupRef.current();
    navigate("/video");
  }, [navigate]);

  const handleToggleAudio = useCallback(() => {
    if (localStream) {
      const enabled = toggleAudio(localStream);
      setIsAudioEnabled(enabled);
    }
  }, [localStream]);

  const handleToggleVideo = useCallback(() => {
    if (localStream) {
      const enabled = toggleVideo(localStream);
      setIsVideoEnabled(enabled);
    }
  }, [localStream]);

  useEffect(() => {
    if (roomId && !hasJoinedRoom.current) {
      initializeMedia();
    }

    // Cleanup function
    return () => {
      cleanupRef.current();
    };
  }, [roomId, initializeMedia]);

  // Add this function at the component level
  const addParticipant = useCallback((userId: string, stream: MediaStream) => {
    setParticipants((prev) => {
      // Check if participant already exists
      const exists = prev.some((p) => p.userId === userId);
      if (exists) return prev;

      // Add new participant
      return [
        ...prev,
        {
          userId,
          username: `User ${userId.slice(0, 4)}`,
          stream,
        },
      ];
    });
  }, []);

  // Handle incoming WebRTC events
  useEffect(() => {
    if (!socket || !roomId || !localStream) return;

    console.log("Setting up WebRTC event handlers");

    const handleUserJoined = async ({userId}: {userId: string}) => {
      console.log("User joined:", userId);

      const peerConnection = await handlePeerConnection(
        socket,
        localStream,
        userId,
        roomId,
        (stream, userId) => {
          console.log("Got remote stream from user:", userId);
          addParticipant(userId, stream);
        }
      );

      await createAndSendOffer(socket, peerConnection, userId, roomId);
    };

    const handleOffer = async ({
      offer,
      remoteUserId,
    }: {
      offer: RTCSessionDescriptionInit;
      remoteUserId: string;
    }) => {
      console.log("Received offer from:", remoteUserId);

      const peerConnection = await handlePeerConnection(
        socket,
        localStream,
        remoteUserId,
        roomId,
        (stream, userId) => {
          console.log("Got remote stream from offer:", userId);
          addParticipant(userId, stream);
        }
      );

      await handleReceivedOffer(
        socket,
        peerConnection,
        offer,
        remoteUserId,
        roomId
      );
    };

    const handleAnswer = async ({
      answer,
      remoteUserId,
    }: {
      answer: RTCSessionDescriptionInit;
      remoteUserId: string;
    }) => {
      const peerConnection = getPeerConnection(remoteUserId)?.connection;
      if (peerConnection) {
        await handleReceivedAnswer(peerConnection, answer);
      }
    };

    const handleIceCandidateMsg = async ({
      candidate,
      remoteUserId,
    }: {
      candidate: RTCIceCandidateInit;
      remoteUserId: string;
    }) => {
      const peerConnection = getPeerConnection(remoteUserId)?.connection;
      if (peerConnection) {
        await handleIceCandidate(peerConnection, candidate);
      }
    };

    const handleUserLeft = ({userId}: {userId: string}) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      // Also cleanup the peer connection
      const peer = getPeerConnection(userId);
      if (peer) {
        peer.connection.close();
        peerConnections.delete(userId);
      }
    };

    // Subscribe to events
    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidateMsg);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidateMsg);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket, roomId, localStream, addParticipant]);

  // Handle screen sharing
  const handleScreenShare = async () => {
    try {
      if (isScreenSharing && screenShareStream.current) {
        screenShareStream.current.getTracks().forEach((track) => track.stop());
        screenShareStream.current = null;
        setIsScreenSharing(false);
        socket.emit("stop-screen-share", {roomId});
      } else {
        const stream = await startScreenShare();
        screenShareStream.current = stream;
        setIsScreenSharing(true);
        socket.emit("start-screen-share", {roomId});

        // Replace video track for all peer connections
        const videoTrack = stream.getVideoTracks()[0];

        // Convert Map entries to array of PeerConnection objects with proper typing
        const connections = Array.from(
          peerConnections.values()
        ) as PeerConnectionWithStream[];

        connections.forEach((peer: PeerConnectionWithStream) => {
          const sender = peer.connection
            .getSenders()
            .find((s: RTCRtpSender) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
    } catch (error) {
      console.error("Screen sharing error:", error);
    }
  };

  if (!isInRoom || !roomId) {
    return (
      <VideoRoomForm
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  const gridColumns =
    participants.length <= 1
      ? 1
      : participants.length <= 4
      ? 2
      : participants.length <= 9
      ? 3
      : 4;

  return (
    <Box sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
      <Box sx={{flex: 1, p: 2, position: "relative"}}>
        {roomId && <RoomInfo roomId={roomId} />}
        <Grid container spacing={2} sx={{height: "100%"}}>
          {localStream && user && (
            <Grid item xs={12 / gridColumns}>
              <Paper elevation={3} sx={{height: "100%", overflow: "hidden"}}>
                <VideoStream
                  stream={localStream}
                  isLocal
                  username={user.username}
                />
              </Paper>
            </Grid>
          )}
          {participants.map((participant) => (
            <Grid key={participant.userId} item xs={12 / gridColumns}>
              <Paper elevation={3} sx={{height: "100%", overflow: "hidden"}}>
                <VideoStream
                  stream={participant.stream}
                  username={participant.username}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          backgroundColor: "background.paper",
        }}
      >
        <IconButton onClick={handleToggleAudio}>
          {isAudioEnabled ? <FiMic /> : <FiMicOff color="red" />}
        </IconButton>
        <IconButton onClick={handleToggleVideo}>
          {isVideoEnabled ? <FiVideo /> : <FiVideoOff color="red" />}
        </IconButton>
        <IconButton color="error" onClick={handleLeaveRoom}>
          <FiPhoneOff />
        </IconButton>
        <IconButton
          onClick={handleScreenShare}
          color={isScreenSharing ? "primary" : "default"}
        >
          <FiMonitor />
        </IconButton>
        <IconButton onClick={() => setIsChatOpen(true)}>
          <Badge badgeContent={0} color="primary">
            <FiMessageSquare />
          </Badge>
        </IconButton>
        <IconButton onClick={() => setIsParticipantsOpen(true)}>
          <Badge badgeContent={participants.length} color="primary">
            <FiUsers />
          </Badge>
        </IconButton>
      </Paper>

      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      >
        <VideoChatPanel roomId={roomId!} onClose={() => setIsChatOpen(false)} />
      </Drawer>

      <Drawer
        anchor="right"
        open={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
      >
        {/* We'll create ParticipantsList component next */}
        <ParticipantsList
          participants={participants}
          localUser={user}
          onClose={() => setIsParticipantsOpen(false)}
        />
      </Drawer>
    </Box>
  );
};

export default VideoRoom;
