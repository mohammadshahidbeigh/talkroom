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
import useAppSelector from "../hooks/useAppSelector";
import {useUpdateUserMutation} from "../services/apiSlice";
import {uploadFile} from "../services/api";
import useAppDispatch from "../hooks/useAppDispatch";
import {updateUser as updateAuthUser} from "../store/slices/authSlice";
import {toggleDarkMode} from "../store/slices/settingsSlice";

interface UserProfileProps {
  username?: string;
  email?: string;
  avatar?: string;
}

const UserProfile: React.FC<UserProfileProps> = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const user = useAppSelector((state) => state.auth.user);
  const [updateUser] = useUpdateUserMutation();
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.settings.darkMode);

  const [profileData, setProfileData] = React.useState({
    username: user?.username || "",
    email: user?.email || "",
    avatar: user?.avatarUrl || "",
    fullName: user?.fullName || "",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        avatar: user.avatarUrl || "",
        fullName: user.fullName || "",
      });
    }
  }, [user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please select an image file");
          return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size should be less than 5MB");
          return;
        }

        // Upload file first
        const avatarUrl = await uploadFile(file);

        if (!avatarUrl) {
          throw new Error("Failed to upload avatar");
        }

        // Update user profile with new avatar URL
        const updatedUser = await updateUser({
          avatarUrl,
          username: profileData.username,
          fullName: profileData.fullName,
        }).unwrap();

        // Update local state
        setProfileData((prev) => ({
          ...prev,
          avatar: avatarUrl, // Make sure this matches the URL format from the server
        }));

        // Update Redux store with the full updated user
        dispatch(
          updateAuthUser({
            ...updatedUser,
            avatarUrl, // Make sure the avatarUrl is included in the update
          })
        );

        // Force a re-render of the Avatar component
        const avatarElement = document.querySelector(
          'img[alt="Profile picture"]'
        );
        if (avatarElement) {
          avatarElement.setAttribute("src", avatarUrl);
        }

        alert("Avatar updated successfully!");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        alert("Failed to upload avatar. Please try again.");
      } finally {
        setIsLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleInputChange =
    (field: "username" | "fullName") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setProfileData((prev) => ({...prev, [field]: event.target.value}));
    };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);

      if (!profileData.username.trim() || !profileData.fullName.trim()) {
        alert("Username and Full Name are required");
        return;
      }

      const updatedUser = await updateUser({
        username: profileData.username,
        fullName: profileData.fullName,
        avatarUrl: profileData.avatar,
      }).unwrap();

      dispatch(updateAuthUser(updatedUser));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Please log in to view your profile</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{display: "flex", minHeight: "100vh", bgcolor: "background.default"}}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "240px",
          width: "calc(100% - 240px)",
        }}
      >
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
                      src={
                        profileData.avatar ||
                        user?.avatarUrl ||
                        "/default-avatar.png"
                      }
                      alt="Profile picture"
                      sx={{width: 80, height: 80}}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                    />
                    <Button
                      variant="contained"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      {isLoading ? "Uploading..." : "Change Avatar"}
                    </Button>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Full Name
                    </Typography>
                    <Input
                      fullWidth
                      value={profileData.fullName}
                      onChange={handleInputChange("fullName")}
                      placeholder="Enter your full name"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Username
                    </Typography>
                    <Input
                      fullWidth
                      value={profileData.username}
                      onChange={handleInputChange("username")}
                      placeholder="Enter your username"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Email
                    </Typography>
                    <Input
                      fullWidth
                      type="email"
                      value={profileData.email}
                      disabled
                    />
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
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
                    <Switch
                      checked={darkMode}
                      onChange={handleDarkModeToggle}
                      color="primary"
                    />
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
