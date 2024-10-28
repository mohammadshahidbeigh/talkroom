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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {useForm, Controller, SubmitHandler} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAppDispatch from "../../hooks/useAppDispatch";
import {login} from "../../store/slices/authSlice";
import {FaEnvelope, FaLock} from "react-icons/fa";

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

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Temporarily bypass the actual login process
      console.log("Login data:", data);
      // Simulate a successful login
      const mockUser = {id: "1", name: "Test User", email: data.email};
      const mockToken = "mock-token-12345";
      dispatch(login({user: mockUser, token: mockToken}));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
      }}
    >
      <Card sx={{maxWidth: 400, width: "100%", boxShadow: 3}}>
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
            {/* Add your app logo here */}
            <img
              src="/public/svg.svg"
              alt="App Logo"
              style={{marginBottom: 16, width: 100}}
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
              }}
            >
              Login
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
                  sx={{fontFamily: "Inter, sans-serif", fontSize: "16px"}}
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
                  type="password"
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
                  }}
                  sx={{fontFamily: "Inter, sans-serif", fontSize: "16px"}}
                />
              )}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                marginY: 2,
              }}
            >
              <Controller
                name="rememberMe"
                control={control}
                render={({field}) => (
                  <FormControlLabel
                    control={<Checkbox {...field} />}
                    label="Remember me"
                    sx={{fontFamily: "Inter, sans-serif", fontSize: "14px"}}
                  />
                )}
              />
              <Link
                to="/forgot-password"
                style={{
                  color: "#4A90E2",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#4A90E2",
                "&:hover": {
                  backgroundColor: "#3A7BC8",
                },
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
              }}
            >
              Log In
            </Button>

            <Typography
              variant="body2"
              sx={{fontFamily: "Inter, sans-serif", fontSize: "14px"}}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{color: "#4A90E2", textDecoration: "none"}}
              >
                Sign up
              </Link>
            </Typography>

            {/* Optional: Add social login buttons here */}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
