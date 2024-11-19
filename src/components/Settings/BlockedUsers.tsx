import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";
import {FiUserCheck} from "react-icons/fi";

interface BlockedUser {
  userId: string;
  chatId: string;
}

interface BlockedUsersProps {
  blockedUsers: BlockedUser[];
  onUnblock: (userId: string) => void;
}

const BlockedUsers: React.FC<BlockedUsersProps> = ({
  blockedUsers,
  onUnblock,
}) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{mb: 2, ml: 2, fontWeight: "bold", color: "text.primary"}}
      >
        Muted Users
      </Typography>
      <List>
        {blockedUsers.map((blocked) => (
          <ListItem
            key={blocked.userId}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => onUnblock(blocked.userId)}
                color="primary"
              >
                <FiUserCheck />
              </IconButton>
            }
          >
            <ListItemText primary={blocked.userId} />
          </ListItem>
        ))}
        {blockedUsers.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No muted users"
              sx={{color: "text.secondary"}}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default BlockedUsers;
