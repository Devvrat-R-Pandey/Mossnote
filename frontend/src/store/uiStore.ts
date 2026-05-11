import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type ModalMode = "create" | "edit" | "view" | "delete" | null;
export type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  toggleTheme: () => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  rateLimited: boolean;
  setRateLimited: (value: boolean) => void;

  modalMode: ModalMode;
  activeNoteId: string | null;
  openModal: (mode: ModalMode, noteId?: string | null) => void;
  closeModal: () => void;

  /** Reset all transient UI state (called on logout) */
  resetEphemeralState: () => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Theme ───────────────────────────────────────────────────────
        theme: "light",
        toggleTheme: () => {
          const next: Theme = get().theme === "light" ? "dark" : "light";
          set({ theme: next }, false, "ui/toggleTheme");
        },

        // ── Sidebar ─────────────────────────────────────────────────────
        sidebarOpen: false,
        toggleSidebar: () =>
          set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "ui/toggleSidebar"),
        closeSidebar: () => set({ sidebarOpen: false }, false, "ui/closeSidebar"),

        // ── Rate limiting ────────────────────────────────────────────────
        rateLimited: false,
        setRateLimited: (value) =>
          set({ rateLimited: value }, false, "ui/setRateLimited"),

        // ── Modals ───────────────────────────────────────────────────────
        modalMode: null,
        activeNoteId: null,
        openModal: (mode, noteId = null) =>
          set({ modalMode: mode, activeNoteId: noteId ?? null }, false, "ui/openModal"),
        closeModal: () =>
          set({ modalMode: null, activeNoteId: null }, false, "ui/closeModal"),

        // ── Reset ────────────────────────────────────────────────────────
        resetEphemeralState: () =>
          set(
            { modalMode: null, activeNoteId: null, rateLimited: false, sidebarOpen: false },
            false,
            "ui/resetEphemeralState"
          ),
      }),
      {
        name: "ui-storage",
        // Only persist theme — all other UI state is session-only
        partialize: (s) => ({ theme: s.theme }),
      }
    ),
    { name: "UiStore", store: "ui" }
  )
);
