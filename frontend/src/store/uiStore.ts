// store/uiStore.ts
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

// ─── Note Modal ───────────────────────────────────────────────────────────────
export type ModalMode = "create" | "edit" | "view" | "delete" | null;

// ─── Theme ────────────────────────────────────────────────────────────────────
export type Theme = "light" | "dark";

// ─── State shape ─────────────────────────────────────────────────────────────
interface UiState {
  // theme
  theme: Theme;
  toggleTheme: () => void;

  // rate limiting
  rateLimited: boolean;
  setRateLimited: (value: boolean) => void;

  // note modal — one modal open at a time, tracked globally
  modalMode: ModalMode;
  activeNoteId: string | null;
  openModal: (mode: ModalMode, noteId?: string | null) => void;
  closeModal: () => void;

  // share urls per note (noteId → shareUrl)
  shareUrls: Record<string, string>;
  setShareUrl: (noteId: string, url: string) => void;
  clearShareUrl: (noteId: string) => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set, get) => ({
        // ── theme ──────────────────────────────────────────────────────────
        theme: "light",
        toggleTheme: () => {
          const next: Theme = get().theme === "light" ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", next);
          set({ theme: next }, false, "ui/toggleTheme");
        },

        // ── rate limiting ──────────────────────────────────────────────────
        rateLimited: false,
        setRateLimited: (value) =>
          set({ rateLimited: value }, false, "ui/setRateLimited"),

        // ── note modal ────────────────────────────────────────────────────
        modalMode: null,
        activeNoteId: null,
        openModal: (mode, noteId = null) =>
          set(
            { modalMode: mode, activeNoteId: noteId ?? null },
            false,
            "ui/openModal"
          ),
        closeModal: () =>
          set(
            { modalMode: null, activeNoteId: null },
            false,
            "ui/closeModal"
          ),

        // ── share urls ────────────────────────────────────────────────────
        shareUrls: {},
        setShareUrl: (noteId, url) =>
          set(
            (s) => ({ shareUrls: { ...s.shareUrls, [noteId]: url } }),
            false,
            "ui/setShareUrl"
          ),
        clearShareUrl: (noteId) =>
          set(
            (s) => {
              const next = { ...s.shareUrls };
              delete next[noteId];
              return { shareUrls: next };
            },
            false,
            "ui/clearShareUrl"
          ),
      }),
      {
        name: "ui-storage",
        // Only persist theme — modal state is ephemeral
        partialize: (s) => ({ theme: s.theme }),
      }
    ),
    { name: "UiStore" }
  )
);
