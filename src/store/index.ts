// client/src/store/index.ts
import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";
import {api} from "../services/api";
import authSlice from "./slices/authSlice";
import chatSlice from "./slices/chatSlice";
import userSlice from "./slices/userSlice";
import videoSlice from "./slices/videoSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSlice,
    chat: chatSlice,
    user: userSlice,
    video: videoSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
