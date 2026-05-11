// Mounts admin-only user-management routes.
import { Router } from "express";
import { getUsers, updateUserRole } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

// Every admin route is locked behind two middleware gates:
//   1. authMiddleware     — is the JWT valid?
//   2. authorizeRoles     — is the caller already an admin?
router.use(authMiddleware, authorizeRoles("admin"));

// GET /api/admin/users
router.get("/users", getUsers);

// PATCH /api/admin/users/:id/role
// Body: { "role": "admin" | "editor" }
router.patch("/users/:id/role", updateUserRole);

export default router;
