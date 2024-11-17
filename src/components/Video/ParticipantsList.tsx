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
} from "@mui/material";
import {FiX} from "react-icons/fi";

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
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  localUser,
  onClose,
}) => {
  return (
    <Paper
      sx={{
        width: 320,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Participants ({participants.length + 1})
        </Typography>
        <IconButton onClick={onClose}>
          <FiX />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{flex: 1, overflow: "auto"}}>
        {localUser && (
          <ListItem>
            <ListItemAvatar>
              <Avatar>{localUser.username[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${localUser.username} (You)`} />
          </ListItem>
        )}
        {participants.map((participant) => (
          <ListItem key={participant.userId}>
            <ListItemAvatar>
              <Avatar>{participant.username[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={participant.username} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ParticipantsList;
