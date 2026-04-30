// pages/ActivityLogPage.tsx
import { useEffect } from "react";
import { useLogStore } from "../store/logStore";
import { formatIST } from "../utils/formatDate";

const actionBadge: Record<string, string> = {
  CREATE: "badge-success",
  EDIT: "badge-warning",
  DELETE: "badge-error",
  SHARE: "badge-info",
};

const actionIcon: Record<string, string> = {
  CREATE: "✏️",
  EDIT: "🔄",
  DELETE: "🗑️",
  SHARE: "🔗",
};

export const ActivityLogPage = () => {
  const { logs, fetchLogs, loading } = useLogStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-base-content/50">
          All actions performed across notes
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="flex flex-col items-center py-20 gap-2 text-center">
          <p className="text-4xl">📋</p>
          <p className="text-base-content/50">No activity yet</p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <>
          {/* Mobile: card layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            {logs.map((log) => (
              <div key={log.id} className="bg-base-100 border border-base-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`badge badge-sm font-semibold gap-1 ${
                      actionBadge[log.action] ?? "badge-ghost"
                    }`}
                  >
                    {actionIcon[log.action]} {log.action}
                  </span>
                  <span className="text-xs text-base-content/50">
                    {formatIST(log.timestamp)}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{log.noteTitle ?? `#${log.noteId}`}</p>
                <p className="text-xs text-base-content/60 truncate">{log.user}</p>
              </div>
            ))}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden sm:block overflow-x-auto rounded-box border border-base-200">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Note</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap">
                      <span
                        className={`badge badge-sm font-semibold gap-1 ${
                          actionBadge[log.action] ?? "badge-ghost"
                        }`}
                      >
                        {actionIcon[log.action]} {log.action}
                      </span>
                    </td>
                    <td className="text-sm font-mono whitespace-nowrap">{log.user}</td>
                    <td className="text-sm text-base-content/70 whitespace-nowrap min-w-[120px]">
                      {log.noteTitle ?? `#${log.noteId}`}
                    </td>
                    <td className="text-xs text-base-content/50 whitespace-nowrap">
                      {formatIST(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
