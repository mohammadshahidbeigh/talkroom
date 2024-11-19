import dotenv from "dotenv";
import {cleanEnv, str, port, url} from "envalid";

dotenv.config();

const env = cleanEnv(process.env, {
  JWT_SECRET: str(),
  DATABASE_URL: url(),
  REDIS_HOST: str({default: "localhost"}),
  REDIS_PORT: port({default: 6379}),
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
});

export default {
  jwtSecret: env.JWT_SECRET,
  databaseUrl: env.DATABASE_URL,
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    ttl: {
      session: 24 * 60 * 60,
      cache: 3600,
      rateLimit: 60,
    },
  },
  isProduction: env.NODE_ENV === "production",
};
