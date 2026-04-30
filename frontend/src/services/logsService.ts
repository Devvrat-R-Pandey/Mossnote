// services/logsService.ts
import { api } from "../api/axiosInstance";

export type LogAction = "CREATE" | "EDIT" | "DELETE" | "SHARE";

export interface Log {
  _id: string;
  id: string; // normalized
  action: LogAction;
  user: string;
  noteId: string;
  noteTitle?: string;
  timestamp: string; // ISO date string
}

export type LogInput = Omit<Log, "_id" | "id">;

// Normalize _id → id
const normalize = (log: { _id: string; [key: string]: unknown }): Log => ({
  ...log,
  id: log._id,
}) as Log;

export const getLogs = async (): Promise<Log[]> => {
  const res = await api.get<Array<{ _id: string; [key: string]: unknown }>>("/logs");
  return res.data.map(normalize);
};

export const createLog = async (log: LogInput): Promise<Log> => {
  const res = await api.post<{ _id: string; [key: string]: unknown }>("/logs", log);
  return normalize(res.data);
};

export const deleteLog = async (id: string): Promise<void> => {
  await api.delete(`/logs/${id}`);
};