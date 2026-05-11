// Applies request-rate limits, with stricter buckets for auth endpoints.
import { Request, Response, NextFunction } from "express";
import { authRateLimit, generalRateLimit } from "../config/upstash.js";

const getClientKey = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return `${req.path.startsWith("/api/auth") ? "auth" : "global"}:${ip}`;
};

const rateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limiter = req.path.startsWith("/api/auth") ? authRateLimit : generalRateLimit;
    const { success } = await limiter.limit(getClientKey(req));

    if (!success) {
      res.status(429).json({ message: "Too many requests, please try again later" });
      return;
    }

    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    next(error);
  }
};

export default rateLimiter;
