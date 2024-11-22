import dotenv from "dotenv";
import {cleanEnv, str, url} from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
  JWT_SECRET: str(),
  DATABASE_URL: url(),
  REDIS_URL: url(),
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
});

export default {
  jwtSecret: env.JWT_SECRET,
  databaseUrl: env.DATABASE_URL,
  redis: {
    url: env.REDIS_URL,
    ttl: {
      session: 24 * 60 * 60, // 24 hours
      cache: 3600, // 1 hour
      rateLimit: 60, // 1 minute
    },
  },
  isProduction: env.NODE_ENV === "production",
};
