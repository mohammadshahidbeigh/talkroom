// client/src/types/index.ts

// Authentication-related types
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error?: string | null;
}

// API Payload types
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface CreateChatPayload {
  name: string;
  type: string;
  participants: string[];
}

export interface UpdateChatPayload {
  name?: string;
  type?: string;
}

export interface SendMessagePayload {
  chatId: string;
  content: string;
  type: string;
}

// Chat-related types
type MessageType = "text" | "file" | "system" | "deleted";

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  chatId: string;
  createdAt: string;
  sender: User;
}

export interface Participant {
  id: string;
  userId: string;
  chatId: string;
  createdAt: string;
  user: User;
}

export interface Chat {
  id: string;
  name?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  messages: Message[];
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error?: string | null;
}

// Video-related types
export interface VideoStreamState {
  isStreaming: boolean;
  streamId?: string;
  error?: string | null;
}

export interface VideoRoom {
  id: string;
  createdAt: string;
  endedAt?: string;
  participants: VideoRoomParticipant[];
}

export interface VideoRoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  status: string;
  joinedAt: string;
  leftAt?: string;
  user: User;
}

// General API response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Redux slice state types
export interface RootState {
  auth: AuthState;
  chat: ChatState;
  video: VideoStreamState;
}
