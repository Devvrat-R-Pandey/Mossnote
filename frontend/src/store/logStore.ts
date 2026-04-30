// store/logStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getLogs,
  createLog,
  deleteLog,
  type Log,
  type LogInput,
} from "../services/logsService";

interface LogState {
  logs: Log[];
  loading: boolean;

  fetchLogs: () => Promise<void>;
  addLog: (log: LogInput) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

export const useLogStore = create<LogState>()(
  devtools(
    (set) => ({
      logs: [],
      loading: false,

      fetchLogs: async () => {
        set({ loading: true }, false, "logs/fetchLogs/pending");
        try {
          const data = await getLogs();
          set(
            {
              logs: data.sort((a: Log, b: Log) =>
                b.timestamp.localeCompare(a.timestamp)
              ),
              loading: false,
            },
            false,
            "logs/fetchLogs/fulfilled"
          );
        } catch (err) {
          console.error("Failed to fetch logs:", err);
          set({ loading: false }, false, "logs/fetchLogs/rejected");
        }
      },

      addLog: async (log) => {
        try {
          const newLog = await createLog(log);
          set(
            (s) => ({ logs: [newLog, ...s.logs] }),
            false,
            "logs/addLog"
          );
        } catch (err) {
          console.error("Failed to add log:", err);
        }
      },

      removeLog: async (id) => {
        try {
          await deleteLog(id);
          set(
            (s) => ({ logs: s.logs.filter((l) => l.id !== id) }),
            false,
            "logs/removeLog"
          );
        } catch (err) {
          console.error("Failed to delete log:", err);
        }
      },
    }),
    { name: "LogStore" }
  )
);
