import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

// Connection handling
redis.on("connect", () => {
  console.log("✓ Redis connection established 🔥");
});

redis.on("error", (error) => {
  console.error("✕ Redis connection error:", error);
});

// User session management
export const setUserSession = async (userId: string, sessionData: any) => {
  await redis.set(
    `session:${userId}`,
    JSON.stringify(sessionData),
    "EX",
    24 * 60 * 60
  ); // 24 hours expiry
};

export const getUserSession = async (userId: string) => {
  const session = await redis.get(`session:${userId}`);
  return session ? JSON.parse(session) : null;
};

// Chat caching
export const setChatCache = async (chatId: string, messages: any[]) => {
  await redis.set(`chat:${chatId}`, JSON.stringify(messages), "EX", 3600); // 1 hour cache
};

export const getChatCache = async (chatId: string) => {
  const cache = await redis.get(`chat:${chatId}`);
  return cache ? JSON.parse(cache) : null;
};

// User online status
export const setUserOnline = async (userId: string) => {
  await redis.set(`online:${userId}`, "true", "EX", 300); // 5 minutes expiry
};

export const isUserOnline = async (userId: string) => {
  return await redis.exists(`online:${userId}`);
};

// Rate limiting
export const incrementRequestCount = async (ip: string) => {
  const current = await redis.incr(`ratelimit:${ip}`);
  if (current === 1) {
    await redis.expire(`ratelimit:${ip}`, 60); // Reset after 1 minute
  }
  return current;
};

export default redis;
