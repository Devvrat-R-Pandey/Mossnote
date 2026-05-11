import { api } from "../api/axiosInstance";

export type LogAction = "CREATE" | "EDIT" | "UPDATE" | "DELETE" | "SHARE" | "ROLE_CHANGE";

export interface LogUser {
  _id?: string;
  email?: string;
  name?: string;
}

export interface Log {
  _id: string;
  id: string;
  action: LogAction;
  user?: string;
  noteId?: string;
  noteTitle?: string;
  performedBy?: LogUser | string;
  targetUser?: LogUser | string;
  details?: string;
  timestamp: string;
  createdAt?: string;
}

export type LogInput = Omit<Log, "_id" | "id">;

const normalize = (log: { _id: string; [key: string]: unknown }): Log => ({
  ...log,
  id: log._id,
}) as Log;

export interface LogsResponse {
  logs: Log[];
  total: number;
  page: number;
  totalPages: number;
}

export const getLogs = async (page = 1, limit = 15): Promise<LogsResponse> => {
  type RawItem = { _id: string; [key: string]: unknown };
  type PaginatedRes = { logs: RawItem[]; total: number; page: number; totalPages: number };

  const res = await api.get<PaginatedRes | RawItem[]>("/logs", { params: { page, limit } });

  // Handle both old plain-array response (pre-pagination) and new paginated envelope
  if (Array.isArray(res.data)) {
    const logs = res.data.map(normalize);
    return { logs, total: logs.length, page: 1, totalPages: 1 };
  }

  return {
    logs:       res.data.logs.map(normalize),
    total:      res.data.total,
    page:       res.data.page,
    totalPages: res.data.totalPages,
  };
};

export const createLog = async (log: LogInput): Promise<Log> => {
  const res = await api.post<{ _id: string; [key: string]: unknown }>("/logs", log);
  return normalize(res.data);
};

export const deleteLog = async (id: string): Promise<void> => {
  await api.delete(`/logs/${id}`);
};
