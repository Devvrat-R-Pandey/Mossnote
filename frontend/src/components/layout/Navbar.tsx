// components/layout/Navbar.tsx
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { useNavigate, Link } from "react-router-dom";

const roleBadgeColor: Record<string, string> = {
  admin: "badge-error",
  editor: "badge-warning",
  viewer: "badge-info",
};

export const Navbar = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const navigate = useNavigate();

  const avatarLetter = useMemo(
    () => (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase(),
    [user]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  }, [logout, navigate]);

  // ── Guest navbar (login/register pages) ────────────────────────────────
  if (!user) {
    return (
      <div className="drawer drawer-end z-[9999]">
        <input id="guest-sidebar" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="w-full navbar bg-base-200 border-b border-base-300 px-4 shadow-sm">
            <div className="flex-1">
              <Link to="/" className="btn btn-ghost text-xl font-bold tracking-tight">
                📝 Mossnote
              </Link>
            </div>
            {/* Desktop: inline theme toggle */}
            <div className="hidden sm:flex items-center">
              <label className="flex items-center gap-2 cursor-pointer bg-base-100 hover:bg-base-200 px-3 py-1.5 rounded-full border border-base-300 transition-colors">
                <span className="text-xs font-bold leading-none select-none tracking-tight">
                  {theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </span>
                <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={theme === "light"} onChange={toggleTheme} />
              </label>
            </div>
            {/* Mobile: hamburger */}
            <div className="flex-none sm:hidden">
              <label htmlFor="guest-sidebar" aria-label="open sidebar" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </label>
            </div>
          </div>
        </div>
        {/* Mobile Sidebar */}
        <div className="drawer-side">
          <label htmlFor="guest-sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 w-72 min-h-full bg-base-200 flex flex-col gap-2 text-base-content pt-8">
            <li className="menu-title"><span>Settings</span></li>
            <li>
              <label className="flex justify-between items-center w-full cursor-pointer py-3">
                <span className="font-medium">{theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
                <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={theme === "light"} onChange={toggleTheme} />
              </label>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // ── Authenticated navbar ───────────────────────────────────────────────
  return (
    <div className="drawer drawer-end z-[9999]">
      <input id="mobile-sidebar" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="w-full navbar bg-base-200 border-b border-base-300 px-4 shadow-sm">
          <div className="flex-1">
            <Link to="/" className="btn btn-ghost text-xl font-bold tracking-tight">
              📝 Mossnote
            </Link>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-3">
            <span className={`badge badge-sm font-semibold uppercase ${roleBadgeColor[user.role] ?? "badge-neutral"}`}>
              {user.role}
            </span>
            <label className="flex items-center gap-2 cursor-pointer bg-base-100 hover:bg-base-200 px-3 py-1.5 rounded-full border border-base-300 transition-colors">
              <span className="text-xs font-bold leading-none select-none tracking-tight">
                {theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </span>
              <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={theme === "light"} onChange={toggleTheme} />
            </label>
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-9 flex items-center justify-center text-sm font-bold">
                  {avatarLetter}
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-10 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-48 border border-base-200">
                <li className="p-2 text-xs text-base-content/60 font-medium break-all cursor-default hover:bg-transparent">
                  {user.name ?? user.email}
                </li>
                <div className="divider my-0" />
                {user.role === "admin" && (
                  <li><Link to="/logs" className="font-medium text-base-content">Activity Log</Link></li>
                )}
                <li>
                  <button onClick={handleLogout} className="text-error font-medium mt-1 hover:bg-error/10 hover:text-error">Logout</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex-none sm:hidden">
            <label htmlFor="mobile-sidebar" aria-label="open sidebar" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="drawer-side">
        <label htmlFor="mobile-sidebar" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-72 min-h-full bg-base-200 flex flex-col gap-2 text-base-content pt-8">
          <li className="menu-title"><span>Account Info</span></li>
          <div className="px-4 py-3 mb-2 border border-base-300 rounded-xl bg-base-100 shadow-sm flex flex-col gap-1 items-start cursor-default">
            <span className="font-bold text-sm tracking-tight">{user.name ?? "User"}</span>
            <span className="text-xs text-base-content/50 break-all">{user.email}</span>
            <span className={`badge badge-sm font-semibold uppercase mt-2 ${roleBadgeColor[user.role] ?? "badge-neutral"}`}>{user.role}</span>
          </div>
          <li className="menu-title mt-2"><span>Navigation</span></li>
          <li>
            <label className="flex justify-between items-center w-full cursor-pointer py-3">
              <span className="font-medium">{theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
              <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={theme === "light"} onChange={toggleTheme} />
            </label>
          </li>
          {user.role === "admin" && (
            <li>
              <Link to="/logs" onClick={() => (document.getElementById('mobile-sidebar') as HTMLInputElement)?.click()}>
                📋 Activity Log
              </Link>
            </li>
          )}
          <div className="mt-auto"></div>
          <li>
            <button onClick={handleLogout} className="text-error font-bold flex justify-center w-full border border-error/20 bg-error/5 hover:bg-error/10">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
