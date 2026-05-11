import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Inbox, UserMinus, UserPlus, Users } from "lucide-react";
import { fetchUsers, updateUserRole } from "../services/adminService";
import type { ManagedUser } from "../services/adminService";
import { useAuthStore } from "../store/authStore";
import { formatIST } from "../utils/formatDate";

type RoleFilter = "all" | "editor" | "admin";

const PAGE_SIZE = 20;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
};

export const UserManagementPage = () => {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<ManagedUser | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers({
        page,
        limit: PAGE_SIZE,
        role: filter === "all" ? undefined : filter,
      });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
    );
  }, [search, users]);

  const closeModal = useCallback(() => setPendingUser(null), []);

  const confirmAction = useCallback(async () => {
    if (!pendingUser) return;

    const nextRole = pendingUser.role === "admin" ? "editor" : "admin";
    const previousRole = pendingUser.role;
    setSavingUserId(pendingUser._id);
    setPendingUser(null);
    setUsers((current) =>
      current.map((user) =>
        user._id === pendingUser._id ? { ...user, role: nextRole } : user
      )
    );

    try {
      const updated = await updateUserRole(pendingUser._id, nextRole);
      setUsers((current) =>
        current.map((user) => (user._id === updated._id ? updated : user))
      );
      toast.success(`${updated.name} is now an ${updated.role}`);
    } catch (err) {
      setUsers((current) =>
        current.map((user) =>
          user._id === pendingUser._id ? { ...user, role: previousRole } : user
        )
      );
      toast.error(getErrorMessage(err, "Failed to update user role"));
    } finally {
      setSavingUserId(null);
    }
  }, [pendingUser]);

  const pendingRole = pendingUser?.role === "admin" ? "editor" : "admin";

  const filterTabs: { key: RoleFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "editor", label: "Editors" },
    { key: "admin", label: "Admins" },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Users size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-txt">User Management</h1>
          <p className="text-sm text-txt-secondary">Manage roles and access levels</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-txt placeholder:text-txt-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex rounded-lg border border-border bg-bg p-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                filter === tab.key
                  ? "bg-surface text-txt shadow-sm"
                  : "text-txt-secondary hover:text-txt"
              }`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-danger-light border border-danger/20 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-txt-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const isCurrentUser = currentUser?._id === user._id;

                  return (
                    <tr key={user._id} className="transition-colors hover:bg-surface-hover">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-txt">{user.name}</p>
                        <p className="text-xs text-txt-tertiary">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            user.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-surface-hover text-txt-secondary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-txt-tertiary">
                        {formatIST(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {isCurrentUser ? (
                          <span className="text-xs italic text-txt-tertiary">You</span>
                        ) : user.role === "editor" ? (
                          <button
                            type="button"
                            onClick={() => setPendingUser(user)}
                            disabled={savingUserId === user._id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
                          >
                            {savingUserId === user._id ? (
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                            ) : (
                              <UserPlus size={13} />
                            )}
                            Promote
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingUser(user)}
                            disabled={savingUserId === user._id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-light disabled:opacity-50"
                          >
                            {savingUserId === user._id ? (
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-danger/30 border-t-danger" />
                            ) : (
                              <UserMinus size={13} />
                            )}
                            Demote
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-txt-tertiary">
              <Inbox size={40} className="mb-3" />
              <p className="text-sm">Nothing here yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-txt-tertiary">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {pendingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-surface shadow-lg p-6 animate-fade-in">
            <h3 className="text-lg font-bold tracking-tight text-txt">Confirm Role Change</h3>
            <p className="mt-2 text-sm text-txt-secondary">
              {pendingRole === "admin"
                ? `Promote ${pendingUser?.name} to Admin? They will gain full admin access.`
                : `Demote ${pendingUser?.name} to Editor? They will lose admin access immediately.`}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-4 py-2 text-sm font-medium text-txt-secondary transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmAction()}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  pendingRole === "admin" ? "bg-primary hover:bg-primary-hover" : "bg-warning hover:bg-warning/90"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
