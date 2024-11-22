import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type {
  User,
  Chat,
  Message,
  RegisterPayload,
  LoginPayload,
  UpdateUserPayload,
  CreateChatPayload,
  UpdateChatPayload,
  SendMessagePayload,
  RootState,
} from "../types";

const BASE_URL = "https://talk-room-server.vercel.app";

// Define tag types
type TagTypes = "Messages";

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface VideoRoom {
  id: string;
  createdAt: Date;
  endedAt: Date | null;
  creatorId: string;
  participants: VideoRoomParticipant[];
}

interface VideoRoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  status: string;
  joinedAt: Date;
  leftAt: Date | null;
  user: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

export const apiSlice = createApi({
  reducerPath: "api",
  tagTypes: ["Messages"] as const,
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, {getState}) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Auth endpoints
    register: builder.mutation<{token: string; user: User}, RegisterPayload>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    login: builder.mutation<{token: string; user: User}, LoginPayload>({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    updateUser: builder.mutation<User, UpdateUserPayload>({
      query: (data) => ({
        url: "/auth/update",
        method: "PUT",
        body: data,
      }),
    }),
    deleteUser: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/delete",
        method: "DELETE",
      }),
    }),

    // Chat endpoints
    getChats: builder.query<Chat[], void>({
      query: () => "/chat",
    }),
    createChat: builder.mutation<Chat, CreateChatPayload>({
      query: (data) => ({
        url: "/chat",
        method: "POST",
        body: data,
      }),
    }),
    updateChat: builder.mutation<Chat, {id: string; data: UpdateChatPayload}>({
      query: ({id, data}) => ({
        url: `/chat/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteChat: builder.mutation<void, string>({
      query: (id) => ({
        url: `/chat/${id}`,
        method: "DELETE",
      }),
    }),

    // Message endpoints
    getMessages: builder.query<Message[], string>({
      query: (chatId) => `/message/${chatId}`,
      providesTags: (_result, _error, chatId) => [
        {type: "Messages" as TagTypes, id: chatId},
      ],
    }),
    sendMessage: builder.mutation<Message, SendMessagePayload>({
      query: (data) => ({
        url: "/message",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, {chatId}) => [
        {type: "Messages" as TagTypes, id: chatId},
      ],
    }),
    deleteMessage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/message/${id}`,
        method: "DELETE",
      }),
    }),

    // User endpoints
    getAvailableUsers: builder.query<User[], void>({
      query: () => "/user/available",
    }),

    // Password endpoints
    updatePassword: builder.mutation<void, UpdatePasswordPayload>({
      query: (data) => ({
        url: "/auth/password",
        method: "PUT",
        body: data,
      }),
    }),

    // Video Room endpoints
    createVideoRoom: builder.mutation<VideoRoom, void>({
      query: () => ({
        url: "/video",
        method: "POST",
      }),
    }),

    joinVideoRoom: builder.mutation<VideoRoom, string>({
      query: (roomId) => ({
        url: `/video/${roomId}/join`,
        method: "POST",
      }),
    }),

    leaveVideoRoom: builder.mutation<void, string>({
      query: (roomId) => ({
        url: `/video/${roomId}/leave`,
        method: "POST",
      }),
    }),

    getRoomParticipants: builder.query<VideoRoomParticipant[], string>({
      query: (roomId) => `/video/${roomId}/participants`,
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetChatsQuery,
  useCreateChatMutation,
  useUpdateChatMutation,
  useDeleteChatMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useGetAvailableUsersQuery,
  useUpdatePasswordMutation,
  useCreateVideoRoomMutation,
  useJoinVideoRoomMutation,
  useLeaveVideoRoomMutation,
  useGetRoomParticipantsQuery,
} = apiSlice;
