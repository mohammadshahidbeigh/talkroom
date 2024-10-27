// client/src/components/Auth/Register.tsx
import React from "react";
import {useNavigate} from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
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
});

const Register = () => {
  const {control, handleSubmit} = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: {
    name: string;
    email: string;
    password: string;
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
    <Container maxWidth="xs">
      <Typography variant="h4" component="h2" align="center" gutterBottom>
        Register
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
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
            />
          )}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </form>
    </Container>
  );
};

export default Register;
