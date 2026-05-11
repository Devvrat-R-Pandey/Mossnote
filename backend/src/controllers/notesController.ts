// Handles authenticated note CRUD and public shared-note access.
import { Request, Response } from "express";
import mongoose from "mongoose";
import { randomBytes } from "crypto";
import Note from "../models/Note.js";
import jwt from "jsonwebtoken";

const VIEWER_TOKEN_EXPIRY = "15m";

const createShareToken = (): string => randomBytes(32).toString("hex");

const isInvalidId = (id: string): boolean => !mongoose.isValidObjectId(id);

const getRouteParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

// GET /api/notes
export async function getAllNotes(req: Request, res: Response): Promise<void> {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/notes/:id
export async function getNoteById(req: Request, res: Response): Promise<void> {
  try {
    const noteId = getRouteParam(req.params.id);
    if (isInvalidId(noteId)) {
      res.status(400).json({ message: "Invalid note id" });
      return;
    }

    const note = await Note.findById(noteId).lean();
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in getNoteById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/notes/shared/:shareToken - public endpoint (no auth required)
export async function getNoteByShareToken(req: Request, res: Response): Promise<void> {
  try {
    const shareToken = getRouteParam(req.params.shareToken).trim();
    if (!shareToken) {
      res.status(404).json({ message: "Shared note not found" });
      return;
    }

    const note = await Note.findOne({ sharedId: shareToken }).lean();
    if (!note || !note.sharedId) {
      res.status(404).json({ message: "Shared note not found" });
      return;
    }

    const viewerToken = jwt.sign(
      { role: "viewer", noteId: (note._id as unknown as string).toString() },
      process.env.JWT_SECRET as string,
      { expiresIn: VIEWER_TOKEN_EXPIRY }
    );

    res.status(200).json({ viewerToken, note });
  } catch (error) {
    console.error("Error in getNoteByShareToken controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/notes
export async function createNote(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const { title, content } = req.body as {
      title: string;
      content: string;
    };
    if (typeof title !== "string" || typeof content !== "string") {
      res.status(400).json({ message: "Title and content are required" });
      return;
    }

    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();

    if (!normalizedTitle || !normalizedContent) {
      res.status(400).json({ message: "Title and content are required" });
      return;
    }

    const note = await Note.create({
      title: normalizedTitle,
      content: normalizedContent,
      owner: req.user.email,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Error in createNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/notes/:id
export async function updateNote(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const noteId = getRouteParam(req.params.id);
    if (isInvalidId(noteId)) {
      res.status(400).json({ message: "Invalid note id" });
      return;
    }

    const note = await Note.findById(noteId);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (req.user.role === "editor" && note.owner !== req.user.email) {
      res.status(403).json({ message: "Editors can only edit their own notes" });
      return;
    }

    const { title, content, sharedId } = req.body as {
      title?: string;
      content?: string;
      sharedId?: string | null;
    };
    const update: { title?: string; content?: string; sharedId?: string | null } = {};

    if (title !== undefined) {
      if (typeof title !== "string") {
        res.status(400).json({ message: "Title must be a string" });
        return;
      }
      const normalizedTitle = title.trim();
      if (!normalizedTitle) {
        res.status(400).json({ message: "Title cannot be empty" });
        return;
      }
      update.title = normalizedTitle;
    }

    if (content !== undefined) {
      if (typeof content !== "string") {
        res.status(400).json({ message: "Content must be a string" });
        return;
      }
      const normalizedContent = content.trim();
      if (!normalizedContent) {
        res.status(400).json({ message: "Content cannot be empty" });
        return;
      }
      update.content = normalizedContent;
    }

    if (sharedId !== undefined) {
      update.sharedId = sharedId === null ? null : createShareToken();
    }

    const updated = await Note.findByIdAndUpdate(noteId, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/notes/:id
export async function deleteNote(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const noteId = getRouteParam(req.params.id);
    if (isInvalidId(noteId)) {
      res.status(400).json({ message: "Invalid note id" });
      return;
    }

    const note = await Note.findById(noteId);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (req.user.role === "editor" && note.owner !== req.user.email) {
      res.status(403).json({ message: "Editors can only delete their own notes" });
      return;
    }

    await note.deleteOne();
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
