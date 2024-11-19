import dotenv from "dotenv";

dotenv.config();

export default {
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    ttl: {
      session: 24 * 60 * 60, // 24 hours
      cache: 3600, // 1 hour
      rateLimit: 60, // 1 minute
    },
  },
};
