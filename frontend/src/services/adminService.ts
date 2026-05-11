import { api } from "../api/axiosInstance";
import type { User } from "./authService";

export type ManagedUser = User & {
  createdAt: string;
};

export interface UsersResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  totalPages: number;
}

export const fetchUsers = async (params: {
  page?: number;
  limit?: number;
  role?: "admin" | "editor";
}): Promise<UsersResponse> => {
  const res = await api.get<UsersResponse>("/admin/users", { params });
  return res.data;
};

export const updateUserRole = async (
  userId: string,
  role: "admin" | "editor"
): Promise<ManagedUser> => {
  const res = await api.patch<{ user: ManagedUser }>(`/admin/users/${userId}/role`, {
    role,
  });
  return res.data.user;
};
