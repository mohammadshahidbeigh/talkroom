import React from "react";
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Badge,
} from "@mui/material";
import {
  FiX,
  FiUsers,
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
} from "react-icons/fi";
import {useGetRoomParticipantsQuery} from "../../services/apiSlice";

interface Participant {
  userId: string;
  username: string;
  stream: MediaStream;
}

interface User {
  id: string;
  username: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  localUser: User | null;
  onClose: () => void;
  roomId: string;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  localUser,
  onClose,
  roomId,
}) => {
  const {data: roomParticipants} = useGetRoomParticipantsQuery(roomId);
  const theme = useTheme();

  const getUsername = (userId: string) => {
    const participant = roomParticipants?.find((p) => p.userId === userId);
    return participant?.user.username || `User ${userId.slice(0, 4)}`;
  };

  return (
    <Paper
      sx={{
        width: 320,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
          <FiUsers size={24} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{fontWeight: 600}}>
            Participants ({participants.length + 1})
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <FiX />
        </IconButton>
      </Box>

      <List sx={{flex: 1, overflow: "auto", p: 2}}>
        {localUser && (
          <>
            <ListItem
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                  }}
                >
                  {localUser.username[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{fontWeight: 500}}>
                    {localUser.username} (You)
                  </Typography>
                }
              />
              <Badge color="success" variant="dot" />
            </ListItem>
            <Divider sx={{my: 2}} />
          </>
        )}

        {participants.map((participant) => (
          <ListItem
            key={participant.userId}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                bgcolor: alpha(theme.palette.action.hover, 0.7),
              },
              transition: "background-color 0.2s",
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{bgcolor: theme.palette.secondary.main}}>
                {getUsername(participant.userId)[0].toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body1">
                  {getUsername(participant.userId)}
                </Typography>
              }
            />
            <Box sx={{display: "flex", gap: 0.5}}>
              {participant.stream.getAudioTracks()[0]?.enabled ? (
                <FiMic size={16} />
              ) : (
                <FiMicOff size={16} color={theme.palette.error.main} />
              )}
              {participant.stream.getVideoTracks()[0]?.enabled ? (
                <FiVideo size={16} />
              ) : (
                <FiVideoOff size={16} color={theme.palette.error.main} />
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ParticipantsList;
