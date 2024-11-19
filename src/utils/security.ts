import {env} from "../config/env"; // Updated import path

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

export const validateFileUpload = (file: File): boolean => {
  const {MAX_FILE_SIZE, ALLOWED_FILE_TYPES} = env;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds limit");
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error("File type not allowed");
  }

  return true;
};

export const generateStrongPassword = (): string => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};
