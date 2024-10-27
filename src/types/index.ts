// client/src/types/index.ts

// Authentication-related types
export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error?: string | null;
}

// Chat-related types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  activeChatId: string | null;
  error?: string | null;
}

// Video-related types
export interface VideoStreamState {
  isStreaming: boolean;
  streamId?: string;
  error?: string | null;
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
