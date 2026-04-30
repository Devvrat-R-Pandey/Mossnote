// components/notes/NoteModal.tsx
import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNotesStore } from "../../store/notesStore";
import { useUiStore } from "../../store/uiStore";
import type { NormalizedNote } from "../../services/notesService";

interface FormValues {
  title: string;
  content: string;
}

interface NoteModalProps {
  mode: "create" | "edit";
  note?: NormalizedNote;
  onClose: () => void;
}

export const NoteModal = ({ mode, note, onClose }: NoteModalProps) => {
  const addNote = useNotesStore((s) => s.addNote);
  const editNote = useNotesStore((s) => s.editNote);
  const closeModal = useUiStore((s) => s.closeModal);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
    },
  });

  // Sync form when note prop changes (edit mode)
  useEffect(() => {
    reset({ title: note?.title ?? "", content: note?.content ?? "" });
  }, [note, reset]);

  // Stable close handler — prefers explicit onClose prop, falls back to store
  const handleClose = useCallback(() => {
    onClose ? onClose() : closeModal();
  }, [onClose, closeModal]);

  const onSubmit = useCallback(
    async (data: FormValues) => {
      if (mode === "create") {
        await addNote(data);
      } else if (note) {
        await editNote(note.id, data);
      }
      handleClose();
    },
    [mode, note, addNote, editNote, handleClose]
  );

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box w-11/12 max-w-lg animate-fade-in">
        <h3 className="font-bold text-lg mb-4">
          {mode === "create" ? "📝 New Note" : "✏️ Edit Note"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title</span>
            </label>
            <input
              type="text"
              placeholder="Note title..."
              className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
              {...register("title", {
                required: "Title is required",
                maxLength: { value: 120, message: "Title is too long (max 120 chars)" },
              })}
            />
            {errors.title && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.title.message}</span>
              </label>
            )}
          </div>

          {/* Content */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Content</span>
            </label>
            <textarea
              placeholder="Write your note..."
              rows={5}
              className={`textarea textarea-bordered w-full resize-none ${
                errors.content ? "textarea-error" : ""
              }`}
              {...register("content", {
                required: "Content is required",
                minLength: { value: 1, message: "Content cannot be empty" },
              })}
            />
            {errors.content && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.content.message}</span>
              </label>
            )}
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : mode === "create" ? (
                "Create Note"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose} />
    </dialog>
  );
};
