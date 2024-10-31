// client/src/components/Auth/Register.tsx
import {useNavigate, Link} from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAppDispatch from "../../hooks/useAppDispatch";
import {login} from "../../store/slices/authSlice";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaVideo,
  FaComments,
  FaUser,
} from "react-icons/fa";
import {useState} from "react";

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  fullName: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const {control, handleSubmit} = useForm({
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(schema),
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  const onSubmit = async (data: {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });
      const responseData = await response.json();

      if (response.ok) {
        // Store JWT token and user data
        localStorage.setItem("token", responseData.token);
        dispatch(login({user: responseData.user, token: responseData.token}));
        setNotification({
          open: true,
          message: "Registration successful! Redirecting to dashboard...",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Handle registration error
        setNotification({
          open: true,
          message:
            responseData.message || "Registration failed. Please try again.",
          severity: "error",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setNotification({
        open: true,
        message: "Network error. Please check your connection and try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#1a1a2e",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "15%",
        }}
      >
        <FaVideo size={40} color="#4A90E2" />
      </div>

      <div
        style={{
          position: "absolute",
          right: "15%",
        }}
      >
        <FaComments size={40} color="#4A90E2" />
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{width: "100%"}}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        }}
      >
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src="/svg.svg"
              alt="App Logo"
              style={{
                marginBottom: 16,
                width: 100,
                filter: "drop-shadow(0 0 10px rgba(74, 144, 226, 0.5))",
              }}
            />

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
                fontSize: "24px",
                color: "#333333",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              Create Account
            </Typography>

            <Controller
              name="username"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Username"
                  fullWidth
                  margin="normal"
                  required
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4A90E2",
                      },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="fullName"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  required
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaUser />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4A90E2",
                      },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  margin="normal"
                  type="email"
                  required
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaEnvelope />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4A90E2",
                      },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Password"
                  fullWidth
                  margin="normal"
                  type={showPassword ? "text" : "password"}
                  required
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4A90E2",
                      },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  fullWidth
                  margin="normal"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaLock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "16px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4A90E2",
                      },
                    },
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                background: "linear-gradient(45deg, #4A90E2 30%, #63B3ED 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #357ABD 30%, #4A90E2 90%)",
                },
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                padding: "12px",
                borderRadius: "8px",
                textTransform: "none",
                boxShadow: "0 4px 6px rgba(74, 144, 226, 0.25)",
              }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <Typography
              variant="body2"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#4A90E2",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
