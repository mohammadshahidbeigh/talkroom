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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAppDispatch from "../../hooks/useAppDispatch";
import {login} from "../../store/slices/authSlice";
import {FaUser, FaEnvelope, FaLock} from "react-icons/fa";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  termsAccepted: yup
    .boolean()
    .oneOf([true], "You must accept the terms of service")
    .required(),
});

const Register = () => {
  const {control, handleSubmit} = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    resolver: yupResolver(schema),
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }) => {
    try {
      // Replace this with your actual API call
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok) {
        dispatch(login({user: responseData.user, token: responseData.token}));
        navigate("/dashboard");
      } else {
        // Handle registration error
        console.error("Registration failed:", responseData.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
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
              Create Account
            </Typography>

            <Controller
              name="name"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Name"
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
                  sx={{fontFamily: "Inter, sans-serif", fontSize: "16px"}}
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
                  fullWidth
                  margin="normal"
                  type="password"
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

            <Controller
              name="confirmPassword"
              control={control}
              render={({field, fieldState: {error}}) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  fullWidth
                  margin="normal"
                  type="password"
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

            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label="I accept the terms of service"
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    marginTop: 2,
                    marginBottom: 2,
                    alignSelf: "flex-start",
                  }}
                />
              )}
            />

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
              Create Account
            </Button>

            <Typography
              variant="body2"
              sx={{fontFamily: "Inter, sans-serif", fontSize: "14px"}}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{color: "#4A90E2", textDecoration: "none"}}
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
