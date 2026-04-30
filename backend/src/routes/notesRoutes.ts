import { Router } from "express";
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  getNoteBySharedId,
  updateNote,
} from "../controllers/notesController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

// Public route — shared note lookup (must be BEFORE /:id to avoid conflict)
router.get("/shared/:sharedId", getNoteBySharedId);

// Protected routes — all authenticated users can read
router.get("/", authMiddleware, getAllNotes);
router.get("/:id", authMiddleware, getNoteById);

// Write operations — admin and editor only
router.post("/", authMiddleware, authorizeRoles("admin", "editor"), createNote);
router.put("/:id", authMiddleware, authorizeRoles("admin", "editor"), updateNote);

// Delete — admin only
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteNote);

export default router;
