import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

// Test connection
redis.on("connect", () => {
  console.log("✓ Redis connection established");
});

redis.on("error", (error) => {
  console.error("✕ Redis connection error:", error);
});

// Test function
export const testRedisConnection = async () => {
  try {
    await redis.set("test_key", "Hello Redis!");
    const value = await redis.get("test_key");
    console.log("Redis test value:", value);
    return true;
  } catch (error) {
    console.error("Redis test failed:", error);
    return false;
  }
};

export default redis;
