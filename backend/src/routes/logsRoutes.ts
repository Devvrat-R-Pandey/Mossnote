import { Router } from "express";
import { getAllLogs, createLog, deleteLog } from "../controllers/logsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

// View logs — admin only
router.get("/", authMiddleware, authorizeRoles("admin"), getAllLogs);

// Create log — any authenticated user (logged automatically by frontend actions)
router.post("/", authMiddleware, createLog);

// Delete log — admin only
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteLog);

export default router;
