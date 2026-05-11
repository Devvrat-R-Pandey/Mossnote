import { useEffect, type ReactNode } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useUiStore } from "./store/uiStore";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import RateLimitCard from "./components/layout/RateLimitCard";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { ActivityLogPage } from "./pages/ActivityLogPage";
import SharedNotePage from "./pages/SharedNotePage";
import { UserManagementPage } from "./pages/UserManagementPage";

function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("You don't have permission to access that page.");
    }
  }, [user]);

  if (user && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const user = useAuthStore((s) => s.user);
  const theme = useUiStore((s) => s.theme);
  const rateLimited = useUiStore((s) => s.rateLimited);

  // Single source of truth for dark mode — toggles the .dark class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <>
      {rateLimited && <RateLimitCard />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/shared/:sharedId" element={<SharedNotePage />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "editor"]}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route
            path="logs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ActivityLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin", "editor"]}>
                <AdminOnlyRoute>
                  <UserManagementPage />
                </AdminOnlyRoute>
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/unauthorized"
          element={
            <div className="flex h-screen flex-col items-center justify-center gap-4 overflow-y-auto bg-bg px-4">
              <h1 className="text-xl font-bold tracking-tight text-danger">
                Unauthorized
              </h1>
              <p className="text-sm text-txt-secondary">
                You don't have permission to view this page.
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Go Home
              </a>
            </div>
          }
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />
      </Routes>

      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
