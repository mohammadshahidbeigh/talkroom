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
import {
  Box,
  IconButton,
  Paper,
  Badge,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
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
import {
  useCreateVideoRoomMutation,
  useJoinVideoRoomMutation,
  useLeaveVideoRoomMutation,
  useGetRoomParticipantsQuery,
} from "../../services/apiSlice";
import joinSound from "/joined.mp3";
import endSound from "/End.mp3";

interface Participant {
  userId: string;
  username: string;
  stream: MediaStream;
}

interface PeerConnectionWithStream {
  connection: RTCPeerConnection;
  stream: MediaStream;
}

const getOptimalGridSize = (count: number, isMobile: boolean) => {
  if (isMobile) {
    if (count <= 1) return {cols: 1, rows: 1};
    if (count <= 2) return {cols: 1, rows: 2};
    if (count <= 4) return {cols: 2, rows: 2};
    return {
      cols: 2,
      rows: Math.ceil(count / 2),
    };
  } else {
    if (count <= 1) return {cols: 1, rows: 1};
    if (count <= 2) return {cols: 2, rows: 1};
    if (count <= 4) return {cols: 2, rows: 2};
    if (count <= 6) return {cols: 3, rows: 2};
    if (count <= 9) return {cols: 3, rows: 3};
    return {
      cols: 4,
      rows: Math.ceil(count / 4),
    };
  }
};

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
  const [createVideoRoom] = useCreateVideoRoomMutation();
  const [joinVideoRoom] = useJoinVideoRoomMutation();
  const [leaveVideoRoom] = useLeaveVideoRoomMutation();
  const {data: roomParticipants} = useGetRoomParticipantsQuery(roomId ?? "", {
    skip: !roomId,
    pollingInterval: 5000,
  });
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (roomParticipants) {
      setParticipants((prev) =>
        prev.map((participant) => {
          const apiParticipant = roomParticipants.find(
            (p) => p.userId === participant.userId
          );
          if (apiParticipant) {
            return {
              ...participant,
              username: apiParticipant.user.username,
            };
          }
          return participant;
        })
      );
    }
  }, [roomParticipants]);

  const playAudio = (type: "join" | "end") => {
    const audio = new Audio(type === "join" ? joinSound : endSound);
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  const handleCreateRoom = useCallback(async () => {
    try {
      const result = await createVideoRoom().unwrap();
      navigate(`/video/${result.id}`);
    } catch (error: unknown) {
      console.error("Failed to create room:", error);
    }
  }, [createVideoRoom, navigate]);

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

  const handleLeaveRoom = useCallback(async () => {
    if (roomId) {
      try {
        playAudio("end");

        await leaveVideoRoom(roomId).unwrap();
        cleanupRef.current();
        navigate("/video");
      } catch (error) {
        console.error("Failed to leave room:", error);
      }
    }
  }, [roomId, leaveVideoRoom, navigate]);

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
      joinVideoRoom(roomId)
        .unwrap()
        .then(() => {
          initializeMedia();
        })
        .catch((error: unknown) => {
          console.error("Failed to join room:", error);
          navigate("/video");
        });
    }
  }, [roomId, joinVideoRoom, initializeMedia, navigate]);

  // Add this function at the component level
  const addParticipant = useCallback(
    (userId: string, stream: MediaStream) => {
      setParticipants((prev) => {
        // Check if participant already exists
        const exists = prev.some((p) => p.userId === userId);
        if (exists) return prev;

        // Try to get username from roomParticipants
        const apiParticipant = roomParticipants?.find(
          (p) => p.userId === userId
        );
        const username =
          apiParticipant?.user.username || `User ${userId.slice(0, 4)}`;

        // Add new participant
        return [
          ...prev,
          {
            userId,
            username,
            stream,
          },
        ];
      });
    },
    [roomParticipants]
  );

  // Handle incoming WebRTC events
  useEffect(() => {
    if (!socket || !roomId || !localStream) return;

    console.log("Setting up WebRTC event handlers");

    const handleUserJoined = async ({userId}: {userId: string}) => {
      console.log("User joined:", userId);
      playAudio("join");

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
      playAudio("end");

      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
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

  const handlePinStream = (participantId: string | null) => {
    setPinnedParticipantId(participantId);
  };

  const totalParticipants = participants.length + (localStream ? 1 : 0);

  if (!isInRoom || !roomId) {
    return (
      <Box
        sx={{
          marginLeft: {xs: 0, md: "240px"}, // Account for sidebar
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <VideoRoomForm
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        marginLeft: {xs: 0, md: "240px"}, // Account for sidebar
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Room Info */}
      <Box
        sx={{
          position: "absolute",
          top: 2,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <RoomInfo roomId={roomId} />
      </Box>

      {/* Video Grid */}
      <Box
        sx={{
          flex: 1,
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            maxWidth: pinnedParticipantId ? "100%" : "1800px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            position: "relative",
          }}
        >
          {pinnedParticipantId ? (
            // Pinned Layout
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {xs: "1fr", md: "3fr 1fr"},
                gridTemplateRows: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 2,
                width: "100%",
                height: "100%",
              }}
            >
              {/* Pinned Stream */}
              <Box
                sx={{
                  gridColumn: {xs: "1 / -1", md: "1 / 2"},
                  gridRow: "1 / -1",
                  height: "100%",
                  aspectRatio: "16/9",
                  overflow: "hidden",
                }}
              >
                {pinnedParticipantId === "local" && localStream && user ? (
                  <VideoStream
                    stream={localStream}
                    isLocal
                    username={user.username}
                    isPinned
                    onPinStream={() => handlePinStream(null)}
                  />
                ) : (
                  participants
                    .filter((p) => p.userId === pinnedParticipantId)
                    .map((participant) => (
                      <VideoStream
                        key={participant.userId}
                        stream={participant.stream}
                        username={participant.username}
                        isPinned
                        onPinStream={() => handlePinStream(null)}
                      />
                    ))
                )}
              </Box>

              {/* Other Streams */}
              <Box
                sx={{
                  gridColumn: {xs: "1 / -1", md: "2 / 3"},
                  gridRow: "1 / -1",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  overflowY: "auto",
                  height: "100%",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "4px",
                  },
                }}
              >
                {/* Local Stream if not pinned */}
                {localStream && user && pinnedParticipantId !== "local" && (
                  <Box sx={{minHeight: "200px", flex: "0 0 auto"}}>
                    <VideoStream
                      stream={localStream}
                      isLocal
                      username={user.username}
                      onPinStream={() => handlePinStream("local")}
                    />
                  </Box>
                )}

                {/* Other participants if not pinned */}
                {participants
                  .filter((p) => p.userId !== pinnedParticipantId)
                  .map((participant) => (
                    <Box
                      key={participant.userId}
                      sx={{minHeight: "200px", flex: "0 0 auto"}}
                    >
                      <VideoStream
                        stream={participant.stream}
                        username={participant.username}
                        onPinStream={() => handlePinStream(participant.userId)}
                      />
                    </Box>
                  ))}
              </Box>
            </Box>
          ) : (
            // Grid Layout
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${
                  getOptimalGridSize(totalParticipants, isMobile).cols
                }, 1fr)`,
                gridAutoRows: "1fr",
                gap: {xs: 1, sm: 2},
                width: "100%",
                height: "100%",
                aspectRatio: totalParticipants <= 1 ? "16/9" : "auto",
                px: {xs: 1, sm: 3},
                py: {xs: 2, sm: 3},
              }}
            >
              {/* Local Stream */}
              {localStream && user && (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: "300px",
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <VideoStream
                      stream={localStream}
                      isLocal
                      username={user.username}
                      onPinStream={() => handlePinStream("local")}
                    />
                  </Paper>
                </Box>
              )}

              {/* Remote Streams */}
              {participants.map((participant) => (
                <Box
                  key={participant.userId}
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: "300px",
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <VideoStream
                      stream={participant.stream}
                      username={participant.username}
                      onPinStream={() => handlePinStream(participant.userId)}
                    />
                  </Paper>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: {xs: 0, md: "240px"}, // Account for sidebar
          right: 0,
          p: {xs: 1, sm: 2},
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            px: {xs: 1, sm: 3},
            py: {xs: 1, sm: 1.5},
            display: "flex",
            gap: {xs: 1, sm: 2},
            borderRadius: {xs: 3, sm: 5},
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <IconButton
            onClick={handleToggleAudio}
            sx={{
              p: {xs: 1, sm: 1.5},
              bgcolor: isAudioEnabled ? "transparent" : "error.main",
              color: isAudioEnabled ? "inherit" : "white",
              "&:hover": {
                bgcolor: isAudioEnabled ? "action.hover" : "error.dark",
              },
            }}
          >
            {isAudioEnabled ? (
              <FiMic size={isMobile ? 18 : 24} />
            ) : (
              <FiMicOff size={isMobile ? 18 : 24} />
            )}
          </IconButton>
          <IconButton
            onClick={handleToggleVideo}
            sx={{
              p: {xs: 1, sm: 1.5},
              bgcolor: isVideoEnabled ? "transparent" : "error.main",
              color: isVideoEnabled ? "inherit" : "white",
              "&:hover": {
                bgcolor: isVideoEnabled ? "action.hover" : "error.dark",
              },
            }}
          >
            {isVideoEnabled ? (
              <FiVideo size={isMobile ? 18 : 24} />
            ) : (
              <FiVideoOff size={isMobile ? 18 : 24} />
            )}
          </IconButton>
          <IconButton
            onClick={handleScreenShare}
            sx={{
              p: {xs: 1, sm: 1.5},
              bgcolor: isScreenSharing ? "primary.main" : "transparent",
              color: isScreenSharing ? "white" : "inherit",
              "&:hover": {
                bgcolor: isScreenSharing ? "primary.dark" : "action.hover",
              },
            }}
          >
            <FiMonitor size={isMobile ? 18 : 24} />
          </IconButton>
          <IconButton
            onClick={() => setIsChatOpen(true)}
            sx={{p: {xs: 1, sm: 1.5}}}
          >
            <Badge badgeContent={0} color="primary">
              <FiMessageSquare size={isMobile ? 18 : 24} />
            </Badge>
          </IconButton>
          <IconButton
            onClick={() => setIsParticipantsOpen(true)}
            sx={{p: {xs: 1, sm: 1.5}}}
          >
            <Badge badgeContent={participants.length} color="primary">
              <FiUsers size={isMobile ? 18 : 24} />
            </Badge>
          </IconButton>
          <IconButton
            onClick={handleLeaveRoom}
            sx={{
              p: {xs: 1, sm: 1.5},
              bgcolor: "error.main",
              color: "white",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <FiPhoneOff size={isMobile ? 18 : 24} />
          </IconButton>
        </Paper>
      </Box>

      {/* Drawers */}
      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        PaperProps={{
          sx: {
            width: {xs: "100%", sm: 320},
            marginLeft: {xs: 0, md: "240px"}, // Account for sidebar
          },
        }}
      >
        <VideoChatPanel roomId={roomId} onClose={() => setIsChatOpen(false)} />
      </Drawer>

      <Drawer
        anchor="right"
        open={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        PaperProps={{
          sx: {
            width: {xs: "100%", sm: 320},
            marginLeft: {xs: 0, md: "240px"}, // Account for sidebar
          },
        }}
      >
        <ParticipantsList
          participants={participants}
          localUser={user}
          onClose={() => setIsParticipantsOpen(false)}
          roomId={roomId}
        />
      </Drawer>
    </Box>
  );
};

export default VideoRoom;
