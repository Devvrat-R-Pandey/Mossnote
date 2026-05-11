// Configures rate limiters for general and auth traffic.
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const redis = Redis.fromEnv();

export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "60 s"),
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});
