import { memo } from "react";
import toast from "react-hot-toast";
import { useNotesStore } from "../../store/notesStore";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { NoteModal } from "./NoteModal";
import type { NormalizedNote } from "../../services/notesService";
import { formatIST } from "../../utils/formatDate";

export const NoteCard = memo(({ note }: { note: NormalizedNote }) => {
  const removeNote = useNotesStore((s) => s.removeNote);
  const shareNote = useNotesStore((s) => s.shareNote);
  const user = useAuthStore((s) => s.user);
  
  const { openModal, closeModal, modalMode, activeNoteId, shareUrls, setShareUrl, clearShareUrl } = useUiStore();
  const shareUrl = shareUrls[note.id] ?? null;

  const isAdmin = user?.role === "admin";
  const isOwner = user?.email === note.owner;
  const canEdit = isAdmin || (user?.role === "editor" && isOwner);

  const formattedDate = formatIST(note.updatedAt);

  const isViewOpen = modalMode === "view" && activeNoteId === note.id;
  const isEditOpen = modalMode === "edit" && activeNoteId === note.id;
  const isDeleteOpen = modalMode === "delete" && activeNoteId === note.id;

  const handleDelete = async () => {
    await removeNote(note.id);
    closeModal();
  };

  const handleShare = async () => {
    if (shareUrl) {
      clearShareUrl(note.id);
      return;
    }
    const url = await shareNote(note.id);
    if (url) setShareUrl(note.id, url);
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast("Link copied!", { icon: "📋" }))
      .catch(() => toast.error("Copy failed"));
  };

  return (
    <>
      <div className="card note-card-accent bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow flex flex-col animate-fade-in">
        <div className="card-body gap-3 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h2 className="card-title text-base font-semibold leading-tight">{note.title}</h2>
            <span className="badge badge-ghost badge-sm shrink-0">{note.owner}</span>
          </div>

          <p
            className="text-sm opacity-70 cursor-pointer hover:opacity-100 transition-colors line-clamp-4"
            onClick={() => openModal("view", note.id)}
            title="Read full note"
          >
            {note.content}
          </p>

          {note.content.length > 150 && (
            <button
              onClick={() => openModal("view", note.id)}
              className="text-xs text-primary hover:underline text-left w-fit"
            >
              Read more...
            </button>
          )}

          <p className="text-xs opacity-40 mt-auto">Last modified: {formattedDate}</p>

          {/* Soft-expand Accordion Wrapper for Share URL */}
          <div 
            className={`grid transition-all duration-300 ease-in-out w-full ${
              shareUrl ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
          >
            <div className="overflow-hidden flex items-center gap-2 bg-base-200 rounded-lg min-h-0 w-full px-2">
              <span className="text-xs truncate flex-1 font-mono opacity-70 py-2">{shareUrl}</span>
              <button onClick={handleCopy} className="btn btn-xs btn-ghost shrink-0" title="Copy link">📋</button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-1 justify-end">
            <button 
              onClick={handleShare} 
              className={`btn btn-xs btn-outline ${shareUrl ? 'btn-active' : 'btn-info'}`}
            >
              🔗 Share
            </button>
            {canEdit && <button onClick={() => openModal("edit", note.id)} className="btn btn-xs btn-outline btn-warning">✏️ Edit</button>}
            {isAdmin && <button onClick={() => openModal("delete", note.id)} className="btn btn-xs btn-outline btn-error">🗑️ Delete</button>}
          </div>
        </div>
      </div>

      {isViewOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box w-full max-w-xl animate-fade-in">
            <h3 className="font-bold text-lg mb-1">{note.title}</h3>
            <p className="text-xs opacity-50 mb-4">By {note.owner} · Last modified: {formattedDate}</p>
            <div className="divider my-0 mb-4" />
            <p className="text-sm opacity-80 whitespace-pre-wrap">{note.content}</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal} />
        </dialog>
      )}

      {isDeleteOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-sm animate-fade-in">
            <h3 className="font-bold text-lg">Delete Note</h3>
            <p className="py-4 text-sm opacity-80">Are you sure you want to delete <span className="font-semibold">"{note.title}"</span>?</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete}>Delete</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal} />
        </dialog>
      )}

      {isEditOpen && <NoteModal mode="edit" note={note} onClose={closeModal} />}
    </>
  );
});

NoteCard.displayName = "NoteCard";
