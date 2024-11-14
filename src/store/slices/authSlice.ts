// client/src/store/slices/authSlice.ts
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error?: string | null;
}

const getInitialState = (): AuthState => {
  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (parsedUser && !parsedUser.avatarUrl) {
      parsedUser.avatarUrl = null;
    }

    return {
      user: parsedUser,
      token: storedToken || null,
      isLoggedIn: Boolean(storedToken),
      loading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error parsing stored user:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return {
      user: null,
      token: null,
      isLoggedIn: false,
      loading: false,
      error: null,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    login(state, action: PayloadAction<{user: User; token: string}>) {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
});

export const {login, logout, updateUser} = authSlice.actions;
export default authSlice.reducer;
