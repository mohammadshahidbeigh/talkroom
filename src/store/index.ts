// client/src/store/index.ts
import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";
import {apiSlice} from "../services/apiSlice";
import authSlice from "./slices/authSlice";
import chatSlice from "./slices/chatSlice";
import userSlice from "./slices/userSlice";
import videoSlice from "./slices/videoSlice";
import settingsSlice from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
    chat: chatSlice,
    user: userSlice,
    video: videoSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
