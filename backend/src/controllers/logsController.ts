// Handles paginated activity log retrieval and individual log management.
import { Request, Response } from "express";
import mongoose from "mongoose";
import Log, { LogAction } from "../models/Log.js";

export async function getAllLogs(req: Request, res: Response): Promise<void> {
  try {
    const page  = Math.max(Number.parseInt(req.query.page  as string, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit as string, 10) || 20, 1), 100);
    const skip  = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("performedBy", "email name")
        .populate("targetUser",  "email name")
        .lean(),
      Log.countDocuments(),
    ]);

    res.status(200).json({
      logs,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("Error in getAllLogs controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createLog(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { action, noteId, noteTitle, timestamp } = req.body as {
      action: LogAction;
      noteId?: string;
      noteTitle?: string;
      timestamp: string;
    };
    const allowedActions: LogAction[] = ["CREATE", "EDIT", "DELETE", "SHARE"];

    if (!allowedActions.includes(action) || !noteId?.trim() || !timestamp?.trim()) {
      res.status(400).json({ message: "Action, noteId, and timestamp are required" });
      return;
    }

    const log = await Log.create({
      action,
      user: req.user.email,
      noteId: noteId.trim(),
      noteTitle: noteTitle?.trim(),
      timestamp,
    });
    res.status(201).json(log);
  } catch (error) {
    console.error("Error in createLog controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteLog(req: Request, res: Response): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid log id" });
      return;
    }

    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) {
      res.status(404).json({ message: "Log not found" });
      return;
    }
    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Error in deleteLog controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
