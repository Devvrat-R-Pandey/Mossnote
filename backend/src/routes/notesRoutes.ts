// Mounts public shared-note and protected note CRUD routes.
import { Router } from "express";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  getNoteByShareToken,
  updateNote,
} from "../controllers/notesController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

// Public route — shared note lookup (must be BEFORE /:id to avoid conflict)
router.get("/shared/:shareToken", getNoteByShareToken);

// Protected routes - editors and admins can read
router.get("/", authMiddleware, authorizeRoles("admin", "editor"), getAllNotes);
router.get("/:id", authMiddleware, authorizeRoles("admin", "editor"), getNoteById);

// Write operations — admin and editor only
router.post("/", authMiddleware, authorizeRoles("admin", "editor"), createNote);
router.put("/:id", authMiddleware, authorizeRoles("admin", "editor"), updateNote);

// Delete - owner editor or admin
router.delete("/:id", authMiddleware, authorizeRoles("admin", "editor"), deleteNote);

export default router;
