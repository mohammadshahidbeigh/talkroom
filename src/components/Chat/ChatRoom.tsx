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
} from "@mui/material";
import {FiPaperclip, FiSend, FiSmile} from "react-icons/fi";
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
    },
    {
      id: 2,
      name: "Bob Smith",
      avatar: "/avatars/02.png",
      lastMessage: "Can we schedule a call?",
      time: "1h ago",
    },
    {
      id: 3,
      name: "Carol Williams",
      avatar: "/avatars/03.png",
      lastMessage: "The project is ready for review",
      time: "3h ago",
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Alice Johnson",
      content: "Hi there! How's the project coming along?",
      time: "10:30 AM",
      isSent: false,
    },
    {
      id: 2,
      sender: "You",
      content:
        "Hey Alice! It's going well. I've just finished the main component.",
      time: "10:32 AM",
      isSent: true,
    },
    {
      id: 3,
      sender: "Alice Johnson",
      content: "That's great news! Can you share a screenshot?",
      time: "10:33 AM",
      isSent: false,
    },
    {
      id: 4,
      sender: "You",
      content: "Sure, I'll send it right away.",
      time: "10:35 AM",
      isSent: true,
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
          marginLeft: "240px", // Match sidebar width
          width: "calc(100% - 240px)", // Adjust width accounting for sidebar
        }}
      >
        {/* Chat Container */}
        <animated.div style={fadeIn}>
          <Box sx={{display: "flex", height: "calc(100vh - 64px)"}}>
            {/* Chat List Sidebar */}
            <Box
              component="aside"
              sx={{
                width: 300,
                bgcolor: "background.paper",
                borderRight: 1,
                borderColor: "grey.200",
                height: "100%",
                position: "fixed",
                left: 240, // Position after main sidebar
                overflowY: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{p: 2}}>
                <TextField
                  fullWidth
                  placeholder="Search chats..."
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Box sx={{flexGrow: 1, overflowY: "auto"}}>
                {chats.map((chat) => (
                  <Box
                    key={chat.id}
                    sx={{
                      p: 2,
                      "&:hover": {bgcolor: "grey.50"},
                      cursor: "pointer",
                    }}
                  >
                    <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                      <Avatar src={chat.avatar} alt={chat.name}>
                        {chat.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Box sx={{flexGrow: 1, minWidth: 0}}>
                        <Typography variant="subtitle2" noWrap>
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
                      <Typography variant="caption" color="text.secondary">
                        {chat.time}
                      </Typography>
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
                marginLeft: "300px", // Match chat sidebar width
              }}
            >
              {/* Chat Header */}
              <Box
                component="header"
                sx={{
                  bgcolor: "background.paper",
                  borderBottom: 1,
                  borderColor: "grey.200",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Avatar src="/avatars/01.png" alt="Alice Johnson">
                  AJ
                </Avatar>
                <Box sx={{ml: 2}}>
                  <Typography variant="h6">Alice Johnson</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Online
                  </Typography>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{flexGrow: 1, p: 2, overflowY: "auto"}}>
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
                      sx={{
                        maxWidth: "70%",
                        bgcolor: message.isSent ? "primary.main" : "grey.100",
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="body2"
                          color={
                            message.isSent
                              ? "primary.contrastText"
                              : "text.primary"
                          }
                        >
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            message.isSent
                              ? "primary.contrastText"
                              : "text.secondary"
                          }
                          sx={{mt: 1, opacity: 0.7}}
                        >
                          {message.time}
                        </Typography>
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
                  borderColor: "grey.200",
                  p: 2,
                }}
              >
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                  <Button variant="outlined" size="small">
                    <FiPaperclip />
                  </Button>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                  />
                  <Button variant="outlined" size="small">
                    <FiSmile />
                  </Button>
                  <Button variant="contained" startIcon={<FiSend />}>
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
