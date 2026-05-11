import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus,
  History,
  Inbox,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useLogStore } from "../store/logStore";
import type { Log, LogUser } from "../services/logsService";

const ACTION_META: Record<string, { label: string; bgClass: string; textClass: string; Icon: LucideIcon }> = {
  ROLE_CHANGE: {
    label: "Role Change",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-600 dark:text-purple-400",
    Icon: ShieldCheck,
  },
  CREATE: { label: "Create", bgClass: "bg-success-light", textClass: "text-success", Icon: FilePlus },
  SHARE:  { label: "Share",  bgClass: "bg-info-light",    textClass: "text-info",    Icon: ExternalLink },
  DELETE: { label: "Delete", bgClass: "bg-danger-light",  textClass: "text-danger",  Icon: Trash2 },
  EDIT:   { label: "Update", bgClass: "bg-warning-light", textClass: "text-warning", Icon: Pencil },
  UPDATE: { label: "Update", bgClass: "bg-warning-light", textClass: "text-warning", Icon: Pencil },
};

const resolveUserEmail = (value?: LogUser | string) => {
  if (!value) return "Unknown User";
  if (typeof value === "string") return value;
  return value.email ?? "Unknown User";
};

const getLogSubject = (log: Log) => {
  if (log.details)    return log.details;
  if (log.noteTitle)  return log.noteTitle;
  if (log.targetUser) return resolveUserEmail(log.targetUser);
  if (log.noteId)     return log.noteId;
  return "Workspace action";
};

// Build page number array with ellipsis for large page counts
const getPageNumbers = (current: number, total: number): (number | "…")[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
};

// Responsive rows per page: mobile 12, laptop 9
const getItemsPerPage = () => (window.matchMedia("(min-width: 1024px)").matches ? 9 : 12);

export const ActivityLogPage = () => {
  const logs      = useLogStore((s) => s.logs);
  const fetchLogs = useLogStore((s) => s.fetchLogs);
  const loading   = useLogStore((s) => s.loading);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  // Listen for breakpoint changes
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => {
      setItemsPerPage(mq.matches ? 11 : 12);
      setCurrentPage(1);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Client-side pagination
  const totalPages    = Math.ceil(logs.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage);
  const pageNumbers   = getPageNumbers(currentPage, totalPages);

  // Reset if page goes out of range after data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const goTo = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <History size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-txt">Activity Log</h1>
          <p className="text-sm text-txt-secondary">
            All actions performed in the workspace
            {loading && (
              <span className="ml-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border border-primary/30 border-t-primary align-middle" />
            )}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {!loading && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-txt-tertiary">
          <Inbox size={40} className="mb-3" />
          <p className="text-sm">Nothing here yet.</p>
        </div>
      )}

      {/* Table */}
      {logs.length > 0 && (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">Performed By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">Target / Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLogs.map((log) => {
                  const meta = ACTION_META[log.action] ?? ACTION_META.UPDATE;
                  const when = log.createdAt ?? log.timestamp;

                  return (
                    <tr key={log._id ?? log.id} className="transition-colors hover:bg-surface-hover">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bgClass} ${meta.textClass}`}
                        >
                          <meta.Icon size={12} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-txt">
                        {resolveUserEmail(log.performedBy) !== "Unknown User"
                          ? resolveUserEmail(log.performedBy)
                          : log.user ?? "Unknown User"}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3 text-sm text-txt-secondary">
                        {getLogSubject(log)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-txt-tertiary">
                        {formatDistanceToNow(new Date(when), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-txt-secondary">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                  type="button"
                  onClick={() => goTo(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page numbers */}
                {pageNumbers.map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-sm text-txt-tertiary select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goTo(p)}
                      className={`min-w-[32px] rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                        p === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "text-txt-secondary hover:bg-surface-hover"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  type="button"
                  onClick={() => goTo(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
