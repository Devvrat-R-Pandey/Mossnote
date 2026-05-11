import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSharedNote } from "../services/notesService";
import type { NormalizedNote } from "../services/notesService";
import { formatIST } from "../utils/formatDate";
import { MarkdownRenderer } from "../components/layout/MarkdownRenderer";

const SharedNotePage = () => {
  const { sharedId } = useParams<{ sharedId: string }>();
  const [note, setNote] = useState<NormalizedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!sharedId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const loadSharedNote = async () => {
      try {
        const sharedNote = await getSharedNote(sharedId);
        if (!isMounted) return;

        if (!sharedNote) {
          setNotFound(true);
          return;
        }

        setNote(sharedNote.note);
      } catch {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadSharedNote();

    return () => {
      isMounted = false;
    };
  }, [sharedId]);

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-bg">
        <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </main>
    );
  }

  if (notFound || !note) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
        <h1 className="text-xl font-bold tracking-tight text-txt">Note Not Available</h1>
        <p className="text-sm text-txt-secondary">
          This note is not available or the link has expired.
        </p>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-y-auto bg-bg">
      <article className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2">
          <span className="rounded-full bg-info-light px-2.5 py-0.5 text-[11px] font-semibold text-info">Read-Only</span>
          <span className="text-xs text-txt-tertiary">Shared Note</span>
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-txt">
          {note.title}
        </h1>

        <div className="mt-2 text-xs text-txt-tertiary">
          By {note.owner} - Last modified: {formatIST(note.updatedAt)}
        </div>

        <div className="my-6 h-px bg-border" />

        <MarkdownRenderer content={note.content} className="text-txt-secondary" />

        <div className="my-6 h-px bg-border" />

        <div className="rounded-lg border border-border bg-bg px-4 py-3 text-sm text-txt-secondary">
          Want a space for your own notes?{" "}
          <Link
            to="/register"
            className="font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Create a Mossnote account
          </Link>
          .
        </div>
      </article>
    </main>
  );
};

export default SharedNotePage;
