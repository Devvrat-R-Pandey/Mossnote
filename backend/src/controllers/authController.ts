// Handles user registration, login, and JWT generation.
import { Request, Response } from "express";
import User, { IUser } from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_EXPIRY = "7d";
const MIN_PASSWORD_LENGTH = 8;

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: JWT_EXPIRY });
};

// POST /api/auth/register
// SECURITY: `role` is intentionally NOT destructured from req.body.
// Any role value sent by the client is silently discarded.
// All new accounts receive the "editor" role via the schema default.
// Admin accounts are created through a controlled server-side process.
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedName || !normalizedEmail || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ message: "Password must be at least 8 characters long" });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    // role is not passed in - Mongoose applies the schema default ("editor")
    const user: IUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    const token = generateToken((user._id as unknown as string).toString());
    res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken((user._id as unknown as string).toString());
    res.status(200).json({ token, user: user.toJSON() });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong during login" });
  }
};
