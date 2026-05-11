// components/notes/NoteModal.tsx
import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNotesStore } from "../../store/notesStore";
import { MarkdownRenderer } from "../layout/MarkdownRenderer";
import type { NormalizedNote } from "../../services/notesService";
import { Eye, Pencil } from "lucide-react";

interface FormValues {
  title: string;
  content: string;
}

interface NoteModalProps {
  mode: "create" | "edit";
  note?: NormalizedNote;
  onClose: () => void;
}

export const NoteModal = React.memo(
  ({ mode, note, onClose }: NoteModalProps) => {
    const addNote = useNotesStore((s) => s.addNote);
    const editNote = useNotesStore((s) => s.editNote);

    // Preview toggle
    const [showPreview, setShowPreview] = useState(false);

    const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors, isSubmitting },
    } = useForm<FormValues>({
      defaultValues: {
        title: note?.title ?? "",
        content: note?.content ?? "",
      },
    });

    const watchedContent = watch("content");

    useEffect(() => {
      reset({ title: note?.title ?? "", content: note?.content ?? "" });
    }, [note, reset]);

    const onSubmit = useCallback(
      async (data: FormValues) => {
        if (mode === "create") {
          await addNote(data);
        } else if (note) {
          await editNote(note.id, data);
        }
        onClose();
      },
      [mode, note, addNote, editNote, onClose],
    );

    const togglePreview = useCallback(() => setShowPreview((p) => !p), []);

    const inputClass =
      "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-txt placeholder:text-txt-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-lg p-6 animate-fade-in">
          <h3 className="font-bold text-lg text-txt mb-4">
            {mode === "create" ? "📝 New Note" : "✏️ Edit Note"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-txt mb-1.5">Title</label>
              <input
                type="text"
                placeholder="Note title..."
                className={`${inputClass} ${errors.title ? "border-danger" : ""}`}
                {...register("title", {
                  required: "Title is required",
                  maxLength: {
                    value: 120,
                    message: "Title is too long (max 120 chars)",
                  },
                })}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-danger">{errors.title.message}</p>
              )}
            </div>

            {/* Content — Edit / Preview toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-txt">Content</label>
                <button
                  type="button"
                  onClick={togglePreview}
                  className="inline-flex items-center gap-1 text-xs font-medium text-txt-secondary transition-colors hover:text-txt"
                >
                  {showPreview ? (
                    <>
                      <Pencil size={12} />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye size={12} />
                      Preview
                    </>
                  )}
                </button>
              </div>

              {showPreview ? (
                <div className="w-full min-h-[8rem] max-h-60 overflow-y-auto rounded-lg border border-border bg-bg px-4 py-3 scrollbar-thin">
                  {watchedContent ? (
                    <MarkdownRenderer content={watchedContent} className="text-sm" />
                  ) : (
                    <p className="text-sm text-txt-tertiary italic">
                      Nothing to preview
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    placeholder="Write your note... (supports Markdown)"
                    rows={5}
                    className={`${inputClass} resize-none ${errors.content ? "border-danger" : ""}`}
                    {...register("content", {
                      required: "Content is required",
                      minLength: {
                        value: 1,
                        message: "Content cannot be empty",
                      },
                    })}
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs text-danger">{errors.content.message}</p>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : mode === "create" ? (
                  "Create Note"
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

NoteModal.displayName = "NoteModal";
