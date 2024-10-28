import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Input,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {Sidebar} from "./Layout";

interface UserProfileProps {
  username?: string;
  email?: string;
  avatar?: string;
}

const UserProfile: React.FC<UserProfileProps> = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const mockUser = {
    username: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://via.placeholder.com/150",
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{display: "flex", minHeight: "100vh", bgcolor: "background.default"}}
    >
      {/* Sidebar */}
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
        {/* Main content area */}
        <Box sx={{flexGrow: 1, overflow: "auto", p: 3}}>
          <Typography variant="h4" sx={{fontWeight: "bold", mb: 3}}>
            Profile Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Personal Information"
                  subheader="Update your personal details here."
                />
                <CardContent
                  sx={{display: "flex", flexDirection: "column", gap: 3}}
                >
                  <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                    <Avatar
                      src={mockUser.avatar}
                      alt="Profile picture"
                      sx={{width: 80, height: 80}}
                    />
                    <Button variant="contained">Change Avatar</Button>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Full Name
                    </Typography>
                    <Input fullWidth defaultValue={mockUser.username} />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Email
                    </Typography>
                    <Input
                      fullWidth
                      type="email"
                      defaultValue={mockUser.email}
                    />
                  </Box>

                  <Button variant="contained">Save Changes</Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Account Settings"
                  subheader="Manage your account preferences."
                />
                <CardContent
                  sx={{display: "flex", flexDirection: "column", gap: 3}}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>Dark Mode</Typography>
                    <Switch />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>Email Notifications</Typography>
                    <Switch />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Language
                    </Typography>
                    <select
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Security"
                  subheader="Manage your account security settings."
                />
                <CardContent>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Change Password" />
                    <Tab label="Two-Factor Authentication" />
                  </Tabs>

                  {tabValue === 0 && (
                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Current Password
                        </Typography>
                        <Input fullWidth type="password" />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          New Password
                        </Typography>
                        <Input fullWidth type="password" />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Confirm New Password
                        </Typography>
                        <Input fullWidth type="password" />
                      </Box>

                      <Button variant="contained">Update Password</Button>
                    </Box>
                  )}

                  {tabValue === 1 && (
                    <Box sx={{mt: 3}}>
                      <Typography paragraph>
                        Two-factor authentication adds an extra layer of
                        security to your account.
                      </Typography>
                      <Button variant="contained">Enable 2FA</Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;
