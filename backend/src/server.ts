// Boots the Express API, security middleware, routes, and database connection.
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import logsRoutes from "./routes/logsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set.");
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean) ?? [];

if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes("*")) {
  throw new Error("CORS_ORIGIN must list explicit origins when credentials are enabled.");
}

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl requests (no origin header) + whitelisted origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// ── SECURITY HEADERS (helmet) ─────────────────────────────────────────────────
// ── BODY PARSING ──────────────────────────────────────────────────────────────
// 20kb cap prevents oversized-payload attacks
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// ── RATE LIMITER (global) ─────────────────────────────────────────────────────
app.use(rateLimiter);

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/logs",  logsRoutes);
app.use("/api/ai",    aiRoutes);
app.use("/api/admin", adminRoutes); // Protected: authMiddleware + authorizeRoles("admin")

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "Mossnote API is running" });
});

// ── 404 HANDLER ───────────────────────────────────────────────────────────────
// Catches any request that didn't match a route above
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
// Must have all 4 parameters for Express to recognise it as an error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Error] ${err.message}`);

  // Surface CORS rejections as 403 instead of a generic 500
  if (err.message.startsWith("CORS blocked")) {
    res.status(403).json({ message: "CORS origin is not allowed" });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
});

// ── START ─────────────────────────────────────────────────────────────────────
// connectDB resolves before we accept any traffic
connectDB().then(() => {
  app.listen(PORT, () => {
    console.info(`Server started on PORT: ${PORT}`);
  });
});
