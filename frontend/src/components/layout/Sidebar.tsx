import { useCallback } from "react";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";
import { History, LayoutDashboard, LogOut, Users } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";

export const Sidebar = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleLogout = useCallback(() => {
    logout();
    closeSidebar();
    toast.success("Logged out successfully");
    navigate("/login");
  }, [closeSidebar, logout, navigate]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-txt-secondary hover:bg-surface-hover hover:text-txt"
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-screen h-[100svh] w-60 shrink-0 transform flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand — logo visible on desktop only (mobile shows it in Navbar) */}
        <div className="flex h-14 items-center px-5">
          <NavLink
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-2"
          >
            <img
              src="/Mossnote.png"
              alt="Mossnote"
              className="hidden lg:block h-7 w-auto object-contain"
              draggable={false}
            />
            <span className="hidden lg:block text-lg font-bold tracking-tight text-txt">
              Mossnote
            </span>
          </NavLink>
        </div>

        {/* User card */}
        <div className="mx-3 rounded-lg border border-border-light bg-bg p-3">
          <p className="text-sm font-semibold text-txt truncate">
            {user?.name ?? "User"}
          </p>
          <p className="mt-0.5 truncate text-xs text-txt-tertiary">
            {user?.email}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              user?.role === "admin"
                ? "bg-primary/10 text-primary"
                : "bg-surface-hover text-txt-secondary"
            }`}
          >
            {user?.role}
          </span>
        </div>

        {/* Navigation — order: Users → Dashboard → Activity Log */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {user?.role === "admin" && (
            <NavLink
              to="/admin/users"
              onClick={closeSidebar}
              className={linkClass}
            >
              <Users size={18} />
              <span>Users</span>
            </NavLink>
          )}

          <NavLink to="/" end onClick={closeSidebar} className={linkClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/logs" onClick={closeSidebar} className={linkClass}>
              <History size={18} />
              <span>Activity Log</span>
            </NavLink>
          )}
        </nav>

        {/* Bottom section */}
        <div className="space-y-1 border-t border-border px-3 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-3 lg:pb-3">
          {/* Dark / Light mode toggle — ON = light mode, OFF = dark mode */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium text-txt-secondary">
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                !isDark ? "bg-primary" : "bg-surface-hover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                  !isDark ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger-light"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
