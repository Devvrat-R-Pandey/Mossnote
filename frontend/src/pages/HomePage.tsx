// pages/HomePage.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { useDebounce } from "../hooks/useDebounce";
import { NoteCard } from "../components/notes/NoteCard";
import { NoteModal } from "../components/notes/NoteModal";
import { SearchBar } from "../components/layout/SearchBar";

export const HomePage = () => {
  // ── Granular selectors prevent unnecessary re-renders ─────────────────
  const notes = useNotesStore((s) => s.notes);
  const fetchNotes = useNotesStore((s) => s.fetchNotes);
  const loading = useNotesStore((s) => s.loading);
  const error = useNotesStore((s) => s.error);
  const user = useAuthStore((s) => s.user);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const modalMode = useUiStore((s) => s.modalMode);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  // Fetch on mount only — stable ref from store avoids infinite loop
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ── Derived values ────────────────────────────────────────────────────
  const canCreate = useMemo(
    () => user?.role === "admin" || user?.role === "editor",
    [user]
  );

  const filteredNotes = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, debouncedSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => openModal("create"), [openModal]);
  const handleSearchChange = useCallback((v: string) => setSearch(v), []);

  const isCreateOpen = modalMode === "create";

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Notes</h1>
          <p className="text-sm text-base-content/50">
            Welcome back,{" "}
            <span className="font-medium text-base-content">
              {user?.name ?? user?.email}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={handleSearchChange} />
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary btn-sm whitespace-nowrap"
            >
              + New Note
            </button>
          )}
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      )}



      {/* Empty state */}
      {!loading && !error && filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <p className="text-5xl">📭</p>
          <p className="text-lg font-semibold text-base-content/70">
            {debouncedSearch ? "No notes match your search" : "No notes yet"}
          </p>
          {canCreate && !debouncedSearch && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary btn-sm mt-2"
            >
              Create your first note
            </button>
          )}
        </div>
      )}

      {/* Notes grid */}
      {!loading && filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Search results count */}
      {debouncedSearch && filteredNotes.length > 0 && (
        <p className="text-sm text-base-content/40 mt-4 text-center">
          {filteredNotes.length} result{filteredNotes.length !== 1 ? "s" : ""} for "
          {debouncedSearch}"
        </p>
      )}

      {/* Create note modal */}
      {isCreateOpen && (
        <NoteModal mode="create" onClose={closeModal} />
      )}

      {/* Viewer notice */}
      {user?.role === "viewer" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="alert alert-info shadow-lg px-6 py-3 text-sm w-auto">
            <span>
              You are in <strong>viewer mode</strong> — you can only read notes.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
