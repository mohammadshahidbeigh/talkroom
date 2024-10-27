// client/src/components/Auth/Login.tsx
import React from "react";
import {useNavigate} from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material";
import {useForm, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import useAppDispatch from "../../hooks/useAppDispatch";
import {login} from "../../store/slices/authSlice";
import {FaEnvelope, FaLock} from "react-icons/fa";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const Login = () => {
  const {control, handleSubmit} = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: {email: string; password: string}) => {
    try {
      // Replace this with your actual API call
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok) {
        dispatch(login({user: responseData.user, token: responseData.token}));
        navigate("/dashboard");
      } else {
        // Handle login error
        console.error("Login failed:", responseData.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 300,
        margin: "auto",
        marginTop: 8,
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
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
          />
        )}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{mt: 3}}
      >
        Login
      </Button>
    </Box>
  );
};

export default Login;
