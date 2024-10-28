// client/src/components/Chat/ChatRoom.tsx
import {useSpring, animated} from "@react-spring/web";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  TextField,
  Box,
  Typography,
  IconButton,
  Badge,
} from "@mui/material";
import {
  FiPaperclip,
  FiSend,
  FiSmile,
  FiMoreVertical,
  FiPhone,
  FiVideo,
} from "react-icons/fi";
import {Sidebar} from "../Layout";

const ChatRoom: React.FC = () => {
  const fadeIn = useSpring({
    from: {opacity: 0},
    to: {opacity: 1},
    config: {duration: 500},
  });

  const chats = [
    {
      id: 1,
      name: "Alice Johnson",
      avatar: "/avatars/01.png",
      lastMessage: "Hey, how are you?",
      time: "2m ago",
      unread: 2,
      isOnline: true,
    },
    {
      id: 2,
      name: "Bob Smith",
      avatar: "/avatars/02.png",
      lastMessage: "Can we schedule a call?",
      time: "1h ago",
      unread: 0,
      isOnline: false,
    },
    {
      id: 3,
      name: "Carol Williams",
      avatar: "/avatars/03.png",
      lastMessage: "The project is ready for review",
      time: "3h ago",
      unread: 1,
      isOnline: true,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Alice Johnson",
      content: "Hi there! How's the project coming along?",
      time: "10:30 AM",
      isSent: false,
      status: "read",
    },
    {
      id: 2,
      sender: "You",
      content:
        "Hey Alice! It's going well. I've just finished the main component.",
      time: "10:32 AM",
      isSent: true,
      status: "read",
    },
    {
      id: 3,
      sender: "Alice Johnson",
      content: "That's great news! Can you share a screenshot?",
      time: "10:33 AM",
      isSent: false,
      status: "read",
    },
    {
      id: 4,
      sender: "You",
      content: "Sure, I'll send it right away.",
      time: "10:35 AM",
      isSent: true,
      status: "sent",
    },
  ];

  return (
    <Box
      sx={{display: "flex", minHeight: "100vh", bgcolor: "background.default"}}
    >
      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "240px",
          width: "calc(100% - 240px)",
        }}
      >
        {/* Chat Container */}
        <animated.div style={fadeIn}>
          <Box sx={{display: "flex", height: "calc(100vh - 64px)"}}>
            {/* Chat List Sidebar */}
            <Box
              component="aside"
              sx={{
                width: 320,
                bgcolor: "background.paper",
                borderRight: 1,
                borderColor: "divider",
                height: "100%",
                position: "fixed",
                left: 240,
                overflowY: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: 1,
              }}
            >
              <Box sx={{p: 2.5, borderBottom: 1, borderColor: "divider"}}>
                <TextField
                  fullWidth
                  placeholder="Search conversations..."
                  variant="outlined"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    },
                  }}
                />
              </Box>
              <Box sx={{flexGrow: 1, overflowY: "auto"}}>
                {chats.map((chat) => (
                  <Box
                    key={chat.id}
                    sx={{
                      p: 2,
                      "&:hover": {bgcolor: "action.hover"},
                      cursor: "pointer",
                      borderBottom: 1,
                      borderColor: "divider",
                      transition: "all 0.2s",
                    }}
                  >
                    <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                        variant="dot"
                        color={chat.isOnline ? "success" : "default"}
                      >
                        <Avatar src={chat.avatar} alt={chat.name}>
                          {chat.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                      </Badge>
                      <Box sx={{flexGrow: 1, minWidth: 0}}>
                        <Typography variant="subtitle1" fontWeight={500} noWrap>
                          {chat.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {chat.lastMessage}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {chat.time}
                        </Typography>
                        {chat.unread > 0 && (
                          <Badge
                            badgeContent={chat.unread}
                            color="primary"
                            sx={{mt: 0.5}}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Chat Area */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                marginLeft: "320px",
                bgcolor: "grey.50",
              }}
            >
              {/* Chat Header */}
              <Box
                component="header"
                sx={{
                  bgcolor: "background.paper",
                  borderBottom: 1,
                  borderColor: "divider",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: 1,
                }}
              >
                <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                    variant="dot"
                    color="success"
                  >
                    <Avatar
                      src="/avatars/01.png"
                      alt="Alice Johnson"
                      sx={{width: 48, height: 48}}
                    >
                      AJ
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Alice Johnson
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Online
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{display: "flex", gap: 1}}>
                  <IconButton color="primary">
                    <FiPhone />
                  </IconButton>
                  <IconButton color="primary">
                    <FiVideo />
                  </IconButton>
                  <IconButton>
                    <FiMoreVertical />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{flexGrow: 1, p: 3, overflowY: "auto"}}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: "flex",
                      justifyContent: message.isSent
                        ? "flex-end"
                        : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        maxWidth: "70%",
                        bgcolor: message.isSent
                          ? "primary.main"
                          : "background.paper",
                        borderRadius: 3,
                      }}
                    >
                      <CardContent sx={{pb: "12px !important"}}>
                        <Typography
                          variant="body1"
                          color={
                            message.isSent
                              ? "primary.contrastText"
                              : "text.primary"
                          }
                        >
                          {message.content}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color={
                              message.isSent
                                ? "primary.contrastText"
                                : "text.secondary"
                            }
                            sx={{opacity: 0.8}}
                          >
                            {message.time}
                          </Typography>
                          {message.isSent && (
                            <Typography
                              variant="caption"
                              color="primary.contrastText"
                              sx={{opacity: 0.8}}
                            >
                              • {message.status}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>

              {/* Message Input */}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  borderTop: 1,
                  borderColor: "divider",
                  p: 2,
                  boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                  <IconButton color="primary" size="medium">
                    <FiPaperclip />
                  </IconButton>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    variant="outlined"
                    size="small"
                    multiline
                    maxRows={4}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "grey.50",
                      },
                    }}
                  />
                  <IconButton color="primary" size="medium">
                    <FiSmile />
                  </IconButton>
                  <Button
                    variant="contained"
                    endIcon={<FiSend />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                    }}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </animated.div>
      </Box>
    </Box>
  );
};

export default ChatRoom;
