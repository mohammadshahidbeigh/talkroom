// client/src/components/Auth/Login.tsx
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
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {useForm, Controller, SubmitHandler} from "react-hook-form";
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
} from "react-icons/fa";
import {useState} from "react";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  rememberMe: yup.boolean().default(false),
});

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const {control, handleSubmit} = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    resolver: yupResolver(schema),
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch("https://talk-room-server.vercel.app/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = "Login failed";
        if (response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (response.status === 404) {
          errorMessage = "User not found";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later";
        }
        throw new Error(errorMessage);
      }

      const {user, token} = responseData;

      if (data.rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      dispatch(login({user, token}));
      setNotification({
        open: true,
        message: `Welcome back, ${user.username}!`,
        severity: "success",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setNotification({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Failed to login. Please try again.",
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
        padding: isMobile ? "1rem" : "2rem",
      }}
    >
      {!isMobile && (
        <>
          <div
            style={{
              position: "absolute",
              left: isTablet ? "10%" : "15%",
              display: isMobile ? "none" : "block",
            }}
          >
            <FaVideo size={isTablet ? 30 : 40} color="#4A90E2" />
          </div>

          <div
            style={{
              position: "absolute",
              right: isTablet ? "10%" : "15%",
              display: isMobile ? "none" : "block",
            }}
          >
            <FaComments size={isTablet ? 30 : 40} color="#4A90E2" />
          </div>
        </>
      )}

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
          maxWidth: isMobile ? "100%" : isTablet ? 350 : 400,
          width: "100%",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: isMobile ? "12px" : "16px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          margin: isMobile ? "0" : "auto",
        }}
      >
        <CardContent sx={{padding: isMobile ? "16px" : "24px"}}>
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
              src="/src/public/svg.svg"
              alt="App Logo"
              style={{
                marginBottom: isMobile ? 12 : 16,
                width: isMobile ? 80 : 100,
                filter: "drop-shadow(0 0 10px rgba(74, 144, 226, 0.5))",
              }}
            />

            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
                fontSize: isMobile ? "20px" : "24px",
                color: "#333333",
                textAlign: "center",
                marginBottom: isMobile ? "1rem" : "1.5rem",
              }}
            >
              Welcome Back
            </Typography>

            <Controller
              name="email"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
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
                    fontSize: isMobile ? "14px" : "16px",
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
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
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
                    fontSize: isMobile ? "14px" : "16px",
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#4A90E2",
                      },
                    },
                  }}
                />
              )}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                marginY: isMobile ? 1 : 2,
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: "#4A90E2",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: isMobile ? "12px" : "14px",
                  pointerEvents: "none",
                  opacity: 0.5,
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                mt: isMobile ? 2 : 3,
                mb: isMobile ? 1.5 : 2,
                background: "linear-gradient(45deg, #4A90E2 30%, #63B3ED 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #357ABD 30%, #4A90E2 90%)",
                },
                fontFamily: "Inter, sans-serif",
                fontSize: isMobile ? "14px" : "16px",
                padding: isMobile ? "8px" : "12px",
                borderRadius: "8px",
                textTransform: "none",
                boxShadow: "0 4px 6px rgba(74, 144, 226, 0.25)",
              }}
            >
              {isLoading ? "Loading..." : "Log In"}
            </Button>

            <Typography
              variant="body2"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: isMobile ? "12px" : "14px",
                textAlign: "center",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#4A90E2",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
