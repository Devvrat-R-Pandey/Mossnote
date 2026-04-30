import { Request, Response } from "express";
import Log, { LogAction } from "../models/Log.js";

// GET /api/logs
export async function getAllLogs(req: Request, res: Response): Promise<void> {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error in getAllLogs controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/logs
export async function createLog(req: Request, res: Response): Promise<void> {
  try {
    const { action, user, noteId, noteTitle, timestamp } = req.body as {
      action: LogAction;
      user: string;
      noteId: string;
      noteTitle?: string;
      timestamp: string;
    };
    const log = await Log.create({ action, user, noteId, noteTitle, timestamp });
    res.status(201).json(log);
  } catch (error) {
    console.error("Error in createLog controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/logs/:id
export async function deleteLog(req: Request, res: Response): Promise<void> {
  try {
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
