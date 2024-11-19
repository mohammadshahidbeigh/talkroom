interface EnvConfig {
  API_URL: string;
  SOCKET_URL: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  SESSION_TIMEOUT: number;
}

export const env: EnvConfig = {
  API_URL: import.meta.env.VITE_API_URL,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || "5242880"),
  ALLOWED_FILE_TYPES: (
    import.meta.env.VITE_ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif"
  ).split(","),
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || "86400000"),
};
