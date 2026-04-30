import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User.js";

/**
 * Role-based authorization middleware.
 * Must be used AFTER authMiddleware (which sets req.user).
 *
 * Usage: authorizeRoles("admin", "editor")
 */
const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
      return;
    }

    next();
  };
};

export default authorizeRoles;
