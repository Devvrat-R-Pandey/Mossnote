import { memo, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useNotesStore } from "../../store/notesStore";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { NoteModal } from "./NoteModal";
import { Assistant } from "../layout/Assistant";
import { useAssistantStore } from "../../store/assistantStore";
import { MarkdownRenderer } from "../layout/MarkdownRenderer";
import type { NormalizedNote } from "../../services/notesService";
import { formatIST } from "../../utils/formatDate";
import { Brain, Share2, Pencil, Trash2 } from "lucide-react";

/** Strip markdown syntax for clean plain-text card preview */
const stripMarkdown = (md: string): string =>
  md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[\s]*[-*+]\s+/gm, "\u2022 ")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/---+/g, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();

/** Track which note the AI panel was last opened for (module-level, not state) */
let _lastAiNoteId: string | null = null;

export const NoteCard = memo(({ note }: { note: NormalizedNote }) => {
  // ── Store selectors ───────────────────────────────────────────────────
  const removeNote = useNotesStore((s) => s.removeNote);
  const shareNote  = useNotesStore((s) => s.shareNote);
  const editNote   = useNotesStore((s) => s.editNote);
  const user       = useAuthStore((s) => s.user);

  const openModal    = useUiStore((s) => s.openModal);
  const closeModal   = useUiStore((s) => s.closeModal);
  const modalMode    = useUiStore((s) => s.modalMode);
  const activeNoteId = useUiStore((s) => s.activeNoteId);

  // ── Local state ───────────────────────────────────────────────────────
  // Keep shareUrl local to avoid re-rendering all NoteCards on every share event
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing]   = useState(false);
  const [aiOpen, setAiOpen]     = useState(false);

  // ── Derived values ────────────────────────────────────────────────────
  const isAdmin       = user?.role === "admin";
  const isOwner       = user?.email === note.owner;
  const canEdit       = isAdmin || (user?.role === "editor" && isOwner);
  const canDelete     = isAdmin || (user?.role === "editor" && isOwner);
  const formattedDate = useMemo(() => formatIST(note.updatedAt), [note.updatedAt]);

  const isViewOpen   = modalMode === "view"   && activeNoteId === note.id;
  const isEditOpen   = modalMode === "edit"   && activeNoteId === note.id;
  const isDeleteOpen = modalMode === "delete" && activeNoteId === note.id;

  // ── AI panel ──────────────────────────────────────────────────────────
  const handleOpenAi = useCallback(() => {
    // Clear chat history when switching between notes
    if (_lastAiNoteId !== note.id) {
      useAssistantStore.getState().clearMessages();
      _lastAiNoteId = note.id;
    }
    setAiOpen(true);
  }, [note.id]);

  const handleCloseAi = useCallback(() => setAiOpen(false), []);

  const handleApplyContent = useCallback(
    async (content: string) => { await editNote(note.id, { title: note.title, content }); },
    [note.id, note.title, editNote]
  );

  const handleApplyTitle = useCallback(
    async (title: string) => { await editNote(note.id, { title, content: note.content }); },
    [note.id, note.content, editNote]
  );

  // ── Card actions ──────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    await removeNote(note.id);
    closeModal();
  }, [removeNote, note.id, closeModal]);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    // Toggle: if URL is already shown, clear it
    if (shareUrl) {
      setShareUrl(null);
      return;
    }
    setSharing(true);
    try {
      const url = await shareNote(note.id);
      if (url) setShareUrl(url);
    } finally {
      setSharing(false);
    }
  }, [sharing, shareUrl, shareNote, note.id]);

  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast("Link copied!", { icon: "📋" }))
      .catch(() => toast.error("Copy failed"));
  }, [shareUrl]);

  const handleOpenView   = useCallback(() => openModal("view",   note.id), [openModal, note.id]);
  const handleOpenEdit   = useCallback(() => openModal("edit",   note.id), [openModal, note.id]);
  const handleOpenDelete = useCallback(() => openModal("delete", note.id), [openModal, note.id]);

  // Truncate content preview at ~200 chars
  const plainText = useMemo(() => {
    const text = stripMarkdown(note.content);
    const LIMIT = 200;
    if (text.length <= LIMIT) return text;
    const cut = text.slice(0, LIMIT);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "\u2026";
  }, [note.content]);

  const iconBtnClass =
    "rounded-lg p-1.5 text-txt-tertiary transition-colors hover:text-txt hover:bg-surface-hover";

  return (
    <>
      {/* ── Card ──────────────────────────────────────────────────────── */}
      <div className="group rounded-xl border border-border bg-surface shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in h-[230px] overflow-hidden flex flex-col">
        {/* Accent top bar */}
        <div className="h-0.5 bg-primary/60 rounded-t-xl" />

        <div className="p-4 flex flex-col flex-1 gap-0">
          {/* Clickable area opens view modal */}
          <div
            className="cursor-pointer flex-1 min-h-0"
            onClick={handleOpenView}
            title="Click to read note"
          >
            {/* Title */}
            <h2
              className="text-sm font-semibold leading-snug text-txt line-clamp-2 mb-2"
              style={{ minHeight: "2.5rem", maxHeight: "2.5rem" }}
            >
              {note.title}
            </h2>

            {/* Content preview */}
            <p
              className="text-sm text-txt-secondary leading-[1.5em]"
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                maxHeight: "4.5em",
              }}
            >
              {plainText}
            </p>
          </div>

          {/* ── Bottom section ─────────────────────────────────────── */}
          <div className="mt-auto flex flex-col gap-2 pt-3">
            <p className="text-xs text-txt-tertiary leading-none">
              Last modified: {formattedDate}
            </p>

            {/* Share URL accordion — CSS grid for smooth reveal without layout jump */}
            <div
              className={`grid transition-all duration-300 ease-in-out w-full ${
                shareUrl
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0 pointer-events-none"
              }`}
            >
              <div className="overflow-hidden flex items-center gap-2 rounded-lg border border-border bg-bg min-h-0 w-full px-2">
                <span className="text-xs truncate flex-1 font-mono text-txt-secondary py-1.5">
                  {shareUrl}
                </span>
                <button onClick={handleCopy} className={iconBtnClass} title="Copy link">
                  📋
                </button>
              </div>
            </div>

            {/* Action icons */}
            <div className="flex gap-1 justify-end">
              <button onClick={handleOpenAi} className={iconBtnClass} title="AI Assistant">
                <Brain size={15} />
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className={`${iconBtnClass} ${shareUrl ? "text-primary" : ""}`}
                title="Share"
              >
                {sharing ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-txt-tertiary/30 border-t-txt-tertiary" />
                ) : (
                  <Share2 size={15} />
                )}
              </button>
              {canEdit && (
                <button onClick={handleOpenEdit} className={iconBtnClass} title="Edit">
                  <Pencil size={15} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleOpenDelete}
                  className="rounded-lg p-1.5 text-txt-tertiary transition-colors hover:text-danger hover:bg-danger-light"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── View modal ──────────────────────────────────────────────────── */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-xl max-h-[75vh] flex flex-col rounded-xl border border-border bg-surface shadow-lg animate-fade-in">
            <div className="shrink-0 px-6 pt-6 pb-2">
              <h3 className="font-bold text-lg text-txt mb-1">{note.title}</h3>
              <p className="text-xs text-txt-tertiary">
                By {note.owner} · Last modified: {formattedDate}
              </p>
              <div className="h-px bg-border mt-3" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-2 scrollbar-thin">
              <MarkdownRenderer content={note.content} className="text-sm text-txt/90" />
            </div>

            <div className="shrink-0 px-6 py-3 border-t border-border flex justify-end">
              <button
                className="rounded-lg px-4 py-1.5 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-6 animate-fade-in">
            <h3 className="font-bold text-lg text-txt">Delete Note</h3>
            <p className="py-4 text-sm text-txt-secondary">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-txt">"{note.title}"</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg px-4 py-2 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      {isEditOpen && <NoteModal mode="edit" note={note} onClose={closeModal} />}

      {/* ── AI Assistant panel ───────────────────────────────────────────── */}
      {aiOpen && (
        <Assistant
          noteContent={note.content}
          canEdit={canEdit}
          onClose={handleCloseAi}
          onApplyContent={handleApplyContent}
          onApplyTitle={handleApplyTitle}
        />
      )}
    </>
  );
});

NoteCard.displayName = "NoteCard";
