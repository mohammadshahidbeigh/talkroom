import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {FiUserCheck} from "react-icons/fi";

interface BlockedUser {
  userId: string;
  chatId: string;
  username: string;
}

interface BlockedUsersProps {
  blockedUsers: BlockedUser[];
  onUnblock: (userId: string) => void;
}

const BlockedUsers: React.FC<BlockedUsersProps> = ({
  blockedUsers,
  onUnblock,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{padding: isSmallScreen ? 1 : 2}}>
      <Typography
        variant={isSmallScreen ? "subtitle1" : "h6"}
        sx={{
          mb: isSmallScreen ? 1 : 2,
          ml: isSmallScreen ? 1 : 2,
          fontWeight: "bold",
          color: "text.primary",
        }}
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
                size={isSmallScreen ? "small" : "medium"}
              >
                <FiUserCheck />
              </IconButton>
            }
          >
            <ListItemText
              primary={blocked.username}
              primaryTypographyProps={{
                variant: isSmallScreen ? "body2" : "body1",
              }}
            />
          </ListItem>
        ))}
        {blockedUsers.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No muted users"
              sx={{color: "text.secondary"}}
              primaryTypographyProps={{
                variant: isSmallScreen ? "body2" : "body1",
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default BlockedUsers;
