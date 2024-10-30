import Redis from "ioredis";
import config from "../config/default";

const redis = new Redis({
  host: config.redisHost,
  port: config.redisPort,
});

export default redis;
