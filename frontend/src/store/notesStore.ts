// store/notesStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import toast from "react-hot-toast";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  type NormalizedNote,
} from "../services/notesService";
import { useLogStore } from "./logStore";
import { useAuthStore } from "./authStore";


interface NotesState {
  notes: NormalizedNote[];
  loading: boolean;
  error: string | null;

  fetchNotes: () => Promise<void>;
  addNote: (input: { title: string; content: string }) => Promise<void>;
  editNote: (id: string, input: { title: string; content: string }) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  shareNote: (id: string) => Promise<string>;
}

export const useNotesStore = create<NotesState>()(
  devtools(
    (set, get) => ({
      notes: [],
      loading: false,
      error: null,

      // ── Fetch all notes ─────────────────────────────────────────────────
      fetchNotes: async () => {
        set({ loading: true, error: null }, false, "notes/fetchNotes/pending");
        try {
          const data = await getNotes();
          set({ notes: data, loading: false }, false, "notes/fetchNotes/fulfilled");
        } catch {
          toast.error("Server is unavailable. Please check your connection or try again later.");
          set(
            { loading: false, error: "Failed to load notes" },
            false,
            "notes/fetchNotes/rejected"
          );
        }
      },

      // ── Create a note ────────────────────────────────────────────────────
      addNote: async ({ title, content }) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          const newNote = await createNote({
            title,
            content,
            owner: user.email,
          });

          set(
            (s) => ({ notes: [...s.notes, newNote] }),
            false,
            "notes/addNote"
          );

          toast.success(`"${newNote.title}" created`);

          await useLogStore.getState().addLog({
            action: "CREATE",
            user: user.email,
            noteId: newNote.id,
            noteTitle: newNote.title,
            timestamp: new Date().toISOString(),
          });
        } catch {
          toast.error("Failed to create note");
        }
      },

      // ── Update a note ─────────────────────────────────────────────────
      editNote: async (id, { title, content }) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const existing = get().notes.find((n) => n.id === id);

        try {
          const updated = await updateNote(id, {
            title,
            content,
            owner: existing?.owner ?? user.email,
          });

          set(
            (s) => ({
              notes: s.notes.map((n) => (n.id === id ? updated : n)),
            }),
            false,
            "notes/editNote"
          );

          toast.success(`"${updated.title}" updated`);

          await useLogStore.getState().addLog({
            action: "EDIT",
            user: user.email,
            noteId: id,
            noteTitle: updated.title,
            timestamp: new Date().toISOString(),
          });
        } catch {
          toast.error("Failed to update note");
        }
      },

      // ── Delete a note ────────────────────────────────────────────────────
      removeNote: async (id) => {
        const user = useAuthStore.getState().user;
        const noteToDelete = get().notes.find((n) => n.id === id);
        // Optimistic removal
        set(
          (s) => ({ notes: s.notes.filter((n) => n.id !== id) }),
          false,
          "notes/removeNote/optimistic"
        );

        try {
          await deleteNote(id);
          toast.success(`"${noteToDelete?.title ?? "Note"}" deleted`);

          if (user) {
            await useLogStore.getState().addLog({
              action: "DELETE",
              user: user.email,
              noteId: id,
              noteTitle: noteToDelete?.title,
              timestamp: new Date().toISOString(),
            });
          }
        } catch {
          // Rollback — restore the note to its original position
          if (noteToDelete) {
            set(
              (s) => ({ notes: [...s.notes, noteToDelete] }),
              false,
              "notes/removeNote/rollback"
            );
          }
          toast.error("Failed to delete note");
        }
      },

      // ── Share note ──────────────────────────────────────────────────────
      shareNote: async (id) => {
        const user = useAuthStore.getState().user;
        const note = get().notes.find((n) => n.id === id);
        if (!note || !user) return "";

        try {
          let sharedId = note.sharedId;

          if (!sharedId) {
            // The backend replaces this sentinel with a cryptographically secure token.
            const updated = await updateNote(id, { ...note, sharedId: "generate" });
            sharedId = updated.sharedId ?? null;
            set(
              (s) => ({
                notes: s.notes.map((n) => (n.id === id ? updated : n)),
              }),
              false,
              "notes/shareNote"
            );
          }

          if (!sharedId) {
            toast.error("Failed to generate share link");
            return "";
          }

          await useLogStore.getState().addLog({
            action: "SHARE",
            user: user.email,
            noteId: id,
            noteTitle: note.title,
            timestamp: new Date().toISOString(),
          });

          const url = `${window.location.origin}/shared/${sharedId}`;
          return url;
        } catch {
          toast.error("Failed to generate share link");
          return "";
        }
      },
    }),
    { name: "NotesStore", store: "notes" }
  )
);
