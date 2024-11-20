// client/src/services/api.ts
import axios, {InternalAxiosRequestConfig} from "axios";
import {User, Chat, Message} from "../types";

const BASE_URL = "https://talk-room-server.vercel.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types for request payloads
interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface UpdateUserPayload {
  username?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface CreateChatPayload {
  name: string;
  type: string;
  participants: string[];
}

interface UpdateChatPayload {
  name?: string;
  type?: string;
}

interface SendMessagePayload {
  chatId: string;
  content: string;
  type: string;
}

interface UploadError extends Error {
  response?: {
    data?: unknown;
  };
}
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{token: string; user: User}>("/auth/register", data),
  login: (data: LoginPayload) =>
    api.post<{token: string; user: User}>("/auth/login", data),
  updateUser: (data: UpdateUserPayload) => api.put<User>("/auth/update", data),
  deleteUser: () => api.delete("/auth/delete"),
};

export const chatApi = {
  getChats: () => api.get<Chat[]>("/chat"),
  createChat: (data: CreateChatPayload) => api.post<Chat>("/chat", data),
  updateChat: (id: string, data: UpdateChatPayload) =>
    api.put<Chat>(`/chat/${id}`, data),
  deleteChat: (id: string) => api.delete(`/chat/${id}`),
};

export const messageApi = {
  getMessages: (chatId: string) => api.get<Message[]>(`/message/${chatId}`),
  sendMessage: (data: SendMessagePayload) =>
    api.post<Message>("/message", data),
  deleteMessage: (id: string) => api.delete(`/message/${id}`),
  getChat: (chatId: string) => api.get<Chat>(`/chat/${chatId}`),
};

export const videoApi = {
  createRoom: () => api.post("/video/room"),
  joinRoom: (roomId: string) => api.post(`/video/room/${roomId}/join`),
  leaveRoom: (roomId: string) => api.post(`/video/room/${roomId}/leave`),
};

export const uploadFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading file:", file);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.post<{url: string}>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log("Upload response:", response.data);

    if (!response.data?.url) {
      throw new Error("No URL returned from upload");
    }

    const fileUrl = response.data.url;
    console.log("File URL:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Upload error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      response: (error as UploadError)?.response?.data,
    });
    throw error;
  }
};

export default api;
