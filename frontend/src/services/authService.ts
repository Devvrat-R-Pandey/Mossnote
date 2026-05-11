// services/authService.ts
import { api } from "../api/axiosInstance";

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

// role is removed — the backend decides, not the client
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

// LOGIN
export const loginUser = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    return user;
  } catch (error: unknown) {
    console.error("Login error:", error);
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { data?: { message?: string } } }).response?.data?.message
    ) {
      throw new Error(
        (error as { response: { data: { message: string } } }).response.data.message
      );
    }
    throw new Error("Something went wrong during login");
  }
};

// REGISTER — role is not sent in the payload
export const registerUser = async (data: RegisterData): Promise<User> => {
  try {
    const res = await api.post<AuthResponse>("/auth/register", data);
    // Don't store token on register — user should log in explicitly
    return res.data.user;
  } catch (error: unknown) {
    console.error("Register error:", error);
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { data?: { message?: string } } }).response?.data?.message
    ) {
      throw new Error(
        (error as { response: { data: { message: string } } }).response.data.message
      );
    }
    throw new Error("Registration failed");
  }
};

// LOGOUT
export const logoutUser = () => {
  localStorage.removeItem("token");
};
