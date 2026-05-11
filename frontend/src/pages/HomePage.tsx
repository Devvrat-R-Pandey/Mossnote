// pages/HomePage.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNotesStore } from "../store/notesStore";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { useDebounce } from "../hooks/useDebounce";
import { NoteCard } from "../components/notes/NoteCard";
import { NoteModal } from "../components/notes/NoteModal";
import { SearchBar } from "../components/layout/SearchBar";
import { NotebookPen, Plus } from "lucide-react";

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
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-txt">My Notes</h1>
          <p className="text-sm text-txt-secondary">
            Welcome back,{" "}
            <span className="font-medium text-txt">
              {user?.name ?? user?.email}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SearchBar value={search} onChange={handleSearchChange} />
          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary-hover"
            >
              <Plus size={16} />
              New Note
            </button>
          )}
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <NotebookPen size={48} className="text-txt-tertiary" strokeWidth={1.5} />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-txt-secondary">
              {debouncedSearch ? "No notes match your search" : "No notes yet"}
            </p>
            <p className="text-sm text-txt-tertiary">
              {debouncedSearch ? "Try a different search term" : "Create your first note to get started"}
            </p>
          </div>
          {canCreate && !debouncedSearch && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus size={16} />
              New Note
            </button>
          )}
        </div>
      )}

      {/* Notes grid */}
      {!loading && filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Search results count */}
      {debouncedSearch && filteredNotes.length > 0 && (
        <p className="text-sm text-txt-tertiary mt-4 text-center">
          {filteredNotes.length} result{filteredNotes.length !== 1 ? "s" : ""} for "
          {debouncedSearch}"
        </p>
      )}

      {/* Create note modal */}
      {isCreateOpen && (
        <NoteModal mode="create" onClose={closeModal} />
      )}
    </div>
  );
};
