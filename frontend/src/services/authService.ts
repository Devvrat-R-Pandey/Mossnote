// services/authService.ts
import { api } from "../api/axiosInstance";

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "editor" | "viewer";
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

    // Store JWT token
    localStorage.setItem("token", token);

    return user;
  } catch (error: unknown) {
    console.error("Login error:", error);
    // Check for specific backend error messages
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

// REGISTER
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

// LOGOUT (clear token)
export const logoutUser = () => {
  localStorage.removeItem("token");
};
