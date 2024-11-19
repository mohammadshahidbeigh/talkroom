import React, {useState} from "react";
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
  Typography,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {FiLock, FiSave} from "react-icons/fi";
import {Sidebar} from "./Layout";
import useAppSelector from "../hooks/useAppSelector";
import {
  useUpdateUserMutation,
  useUpdatePasswordMutation,
} from "../services/apiSlice";
import {uploadFile} from "../services/api";
import useAppDispatch from "../hooks/useAppDispatch";
import {updateUser as updateAuthUser} from "../store/slices/authSlice";
import {toggleDarkMode} from "../store/slices/settingsSlice";

interface UserProfileProps {
  username?: string;
  email?: string;
  avatar?: string;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

const UserProfile: React.FC<UserProfileProps> = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [updateUser] = useUpdateUserMutation();
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.settings.darkMode);
  const [updatePassword] = useUpdatePasswordMutation();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  });

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

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setNotification({
            open: true,
            message: "Please select an image file",
            severity: "error",
          });
          return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setNotification({
            open: true,
            message: "File size should be less than 5MB",
            severity: "error",
          });
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

        setNotification({
          open: true,
          message: "Avatar updated successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error("Error uploading avatar:", error);
        setNotification({
          open: true,
          message: "Failed to upload avatar. Please try again.",
          severity: "error",
        });
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
        setNotification({
          open: true,
          message: "Username and Full Name are required",
          severity: "error",
        });
        return;
      }

      const updatedUser = await updateUser({
        username: profileData.username,
        fullName: profileData.fullName,
        avatarUrl: profileData.avatar,
      }).unwrap();

      dispatch(updateAuthUser(updatedUser));
      setNotification({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      setNotification({
        open: true,
        message: "Failed to update profile. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const handlePasswordChange = async () => {
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setNotification({
          open: true,
          message: "New passwords don't match",
          severity: "error",
        });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setNotification({
          open: true,
          message: "Password must be at least 6 characters long",
          severity: "error",
        });
        return;
      }

      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordFields(false);

      setNotification({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update password:", error);
      setNotification({
        open: true,
        message:
          "Failed to update password. Please check your current password.",
        severity: "error",
      });
    }
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
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
        flexDirection: {xs: "column", md: "row"},
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: {md: "240px"},
          width: {xs: "100%", md: "calc(100% - 240px)"},
        }}
      >
        <Box sx={{flexGrow: 1, overflow: "auto", p: {xs: 2, md: 3}, mt: 4}}>
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

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Security" subheader="Update your password" />
                <CardContent>
                  <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                    {!showPasswordFields ? (
                      <Button
                        variant="outlined"
                        onClick={() => setShowPasswordFields(true)}
                        startIcon={<FiLock />}
                      >
                        Change Password
                      </Button>
                    ) : (
                      <>
                        <TextField
                          type="password"
                          label="Current Password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          fullWidth
                          required
                          autoFocus
                          variant="outlined"
                        />
                        <TextField
                          type="password"
                          label="New Password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          fullWidth
                          required
                          variant="outlined"
                          helperText="Password must be at least 8 characters long"
                        />
                        <TextField
                          type="password"
                          label="Confirm New Password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          fullWidth
                          required
                          variant="outlined"
                          error={
                            passwordData.newPassword !==
                            passwordData.confirmPassword
                          }
                          helperText={
                            passwordData.newPassword !==
                            passwordData.confirmPassword
                              ? "Passwords don't match"
                              : ""
                          }
                        />
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            justifyContent: "flex-end",
                            mt: 2,
                          }}
                        >
                          <Button
                            onClick={() => {
                              setShowPasswordFields(false);
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            }}
                            color="inherit"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handlePasswordChange}
                            disabled={
                              !passwordData.currentPassword ||
                              !passwordData.newPassword ||
                              !passwordData.confirmPassword ||
                              passwordData.newPassword !==
                                passwordData.confirmPassword ||
                              passwordData.newPassword.length < 8
                            }
                            startIcon={<FiSave />}
                          >
                            Update Password
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({...prev, open: false}))}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
      >
        <Alert
          onClose={() => setNotification((prev) => ({...prev, open: false}))}
          severity={notification.severity}
          sx={{width: "100%"}}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;
