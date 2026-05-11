// Handles admin-only user listing and role updates.
import { Request, Response } from "express";
import mongoose from "mongoose";
import User, { type IUser, type UserRole } from "../models/User.js";
import Log from "../models/Log.js";

const VALID_ROLES: UserRole[] = ["admin", "editor"];

// GET /api/admin/users
// Caller must be an admin (enforced by adminRoutes middleware stack)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const role = req.query.role as UserRole | undefined;
    if (role && !VALID_ROLES.includes(role)) {
      res.status(400).json({
        message: `Invalid role filter. Must be one of: ${VALID_ROLES.join(", ")}`,
      });
      return;
    }

    const page = Math.max(Number.parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit as string, 10) || 20, 1),
      100
    );
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("_id name email role createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// PATCH /api/admin/users/:id/role
// Caller must be an admin (enforced by adminRoutes middleware stack)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role: UserRole };
    const targetUserId = req.params.id;

    if (!role || !VALID_ROLES.includes(role)) {
      res.status(400).json({
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      });
      return;
    }

    if (!mongoose.isValidObjectId(targetUserId)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    const callerId = req.user?._id?.toString();
    if (!callerId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const session = await mongoose.startSession();
    let updatedUser: IUser | null = null;
    let previousRole: UserRole | null = null;
    let failure: { status: number; message: string } | null = null;

    try {
      await session.withTransaction(async () => {
        const existingUser = await User.findById(targetUserId).session(session);
        if (!existingUser) {
          failure = { status: 404, message: "User not found" };
          return;
        }

        if (existingUser.role === role) {
          failure = { status: 400, message: `${existingUser.email} is already ${role}.` };
          return;
        }

        if (existingUser.role === "admin" && role === "editor") {
          const adminCount = await User.countDocuments({ role: "admin" }).session(session);
          if (adminCount === 1) {
            failure = {
              status: 400,
              message: "Cannot demote the last admin. Promote another user first.",
            };
            return;
          }
        }

        if (callerId === targetUserId) {
          failure = { status: 400, message: "You cannot change your own role." };
          return;
        }

        previousRole = existingUser.role;
        updatedUser = await User.findByIdAndUpdate(
          targetUserId,
          { $set: { role } },
          { new: true, session }
        );

        if (!updatedUser) {
          failure = { status: 404, message: "User not found" };
          return;
        }

        await Log.create(
          [
            {
              action: "ROLE_CHANGE",
              performedBy: callerId,
              targetUser: updatedUser._id.toString(),
              details: `${updatedUser.email} ${role === "admin" ? "promoted" : "demoted"} from ${previousRole} to ${role}`,
              timestamp: new Date().toISOString(),
            },
          ],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    const roleChangeFailure = failure as { status: number; message: string } | null;
    if (roleChangeFailure) {
      res.status(roleChangeFailure.status).json({ message: roleChangeFailure.message });
      return;
    }

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const responseUser = updatedUser as unknown as IUser;

    res.status(200).json({
      message: `Role updated to "${role}" for ${responseUser.email}`,
      user: responseUser.toJSON(),
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
};
