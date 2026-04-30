// services/notesService.ts
import { api } from "../api/axiosInstance";

export interface Note {
  _id: string;
  title: string;
  content: string;
  owner: string;
  sharedId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility — components use `id` while MongoDB uses `_id`
export type NormalizedNote = Note & { id: string };

// Normalize _id → id for frontend consumption
const normalize = (note: Note): NormalizedNote => ({
  ...note,
  id: note._id,
});

export type NoteInput = Omit<Note, "_id" | "createdAt" | "updatedAt">;

export const getNotes = async (): Promise<NormalizedNote[]> => {
  const res = await api.get<Note[]>("/notes");
  return res.data.map(normalize);
};

export const getNoteById = async (id: string): Promise<NormalizedNote> => {
  const res = await api.get<Note>(`/notes/${id}`);
  return normalize(res.data);
};

export const getNoteBySharedId = async (sharedId: string): Promise<NormalizedNote | null> => {
  try {
    const res = await api.get<Note>(`/notes/shared/${sharedId}`);
    return normalize(res.data);
  } catch {
    return null;
  }
};

export const createNote = async (note: Partial<NoteInput>): Promise<NormalizedNote> => {
  const res = await api.post<Note>("/notes", note);
  return normalize(res.data);
};

export const updateNote = async (
  id: string,
  note: Partial<NoteInput>
): Promise<NormalizedNote> => {
  const res = await api.put<Note>(`/notes/${id}`, note);
  return normalize(res.data);
};

export const deleteNote = async (id: string): Promise<void> => {
  await api.delete(`/notes/${id}`);
};
