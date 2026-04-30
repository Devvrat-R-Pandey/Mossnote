import { Request, Response, NextFunction } from "express";
import ratelimit from "../config/upstash.js";

const rateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { success } = await ratelimit.limit("global-rate-limit");

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
