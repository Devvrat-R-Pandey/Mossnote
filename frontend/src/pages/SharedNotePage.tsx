// pages/SharedNotePage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNoteBySharedId } from "../services/notesService";
import type { NormalizedNote } from "../services/notesService";
import { formatIST } from "../utils/formatDate";

export const SharedNotePage = () => {
  const { sharedId } = useParams<{ sharedId: string }>();
  const [note, setNote] = useState<NormalizedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sharedId) return;
    getNoteBySharedId(sharedId)
      .then((data: NormalizedNote | null) => {
        if (data) setNote(data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sharedId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-5xl">🔍</p>
        <h1 className="text-2xl font-bold">Note Not Found</h1>
        <p className="text-base-content/50">
          This shared link may be invalid or expired.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="card bg-base-100 border border-base-200 shadow-md">
        <div className="card-body gap-4">
          <div className="flex items-center gap-2">
            <span className="badge badge-info badge-sm">Read-Only</span>
            <span className="text-xs text-base-content/40">Shared Note</span>
          </div>

          <h1 className="text-2xl font-bold">{note.title}</h1>

          <div className="divider my-0" />

          <p className="text-base-content/80 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>

          <div className="divider my-0" />

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-base-content/40">
            <span>By {note.owner}</span>
            <span>Last modified: {formatIST(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
