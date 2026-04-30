import { Request, Response } from "express";
import Note from "../models/Note.js";

// GET /api/notes
export async function getAllNotes(req: Request, res: Response): Promise<void> {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/notes/:id
export async function getNoteById(req: Request, res: Response): Promise<void> {
  try {
    const note = await Note.findById(req.params.id);
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

// GET /api/notes/shared/:sharedId — public endpoint (no auth required)
export async function getNoteBySharedId(req: Request, res: Response): Promise<void> {
  try {
    const note = await Note.findOne({ sharedId: req.params.sharedId });
    if (!note) {
      res.status(404).json({ message: "Shared note not found" });
      return;
    }
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in getNoteBySharedId controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/notes
export async function createNote(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, sharedId } = req.body as {
      title: string;
      content: string;
      sharedId?: string;
    };

    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required" });
      return;
    }

    // Owner is always derived from authenticated user (never trusted from body)
    const note = await Note.create({
      title,
      content,
      owner: req.user!.email,
      sharedId,
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
    const note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    // Editors can only update their own notes; admins can update any
    if (req.user!.role === "editor" && note.owner !== req.user!.email) {
      res.status(403).json({ message: "Editors can only edit their own notes" });
      return;
    }

    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/notes/:id (admin-only enforced at route level)
export async function deleteNote(req: Request, res: Response): Promise<void> {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNote controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
