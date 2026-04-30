// store/authStore.ts
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { loginUser, registerUser, logoutUser, type User } from "../services/authService";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  registerSuccess: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: "admin" | "editor" | "viewer"
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  clearRegisterSuccess: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        loading: false,
        error: null,
        registerSuccess: false,

        // ── LOGIN ──────────────────────────────────────────────────────────
        login: async (email, password) => {
          set({ loading: true, error: null }, false, "auth/login/pending");
          try {
            const user = await loginUser(email, password);
            if (!user) throw new Error("Invalid email or password");
            set({ user, loading: false, error: null }, false, "auth/login/fulfilled");
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed";
            set({ error: message, loading: false }, false, "auth/login/rejected");
          }
        },

        // ── REGISTER ───────────────────────────────────────────────────────
        register: async (email, password, name, role = "viewer") => {
          set(
            { loading: true, error: null, registerSuccess: false },
            false,
            "auth/register/pending"
          );
          try {
            await registerUser({ email, password, name, role });
            set(
              { loading: false, registerSuccess: true },
              false,
              "auth/register/fulfilled"
            );
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : "Registration failed";
            set({ error: message, loading: false }, false, "auth/register/rejected");
          }
        },

        // ── LOGOUT ────────────────────────────────────────────────────────
        logout: () => {
          logoutUser(); // Clear JWT from localStorage
          set({ user: null, error: null }, false, "auth/logout");
        },

        // ── HELPERS ───────────────────────────────────────────────────────
        clearError: () => set({ error: null }, false, "auth/clearError"),
        clearRegisterSuccess: () =>
          set({ registerSuccess: false }, false, "auth/clearRegisterSuccess"),
      }),
      {
        name: "auth-storage",
        // Only persist the logged-in user — nothing else
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: "AuthStore" }
  )
);