// App.tsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useUiStore } from "./store/uiStore";
import { Navbar } from "./components/layout/Navbar";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import RateLimitCard from "./components/layout/RateLimitCard";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { ActivityLogPage } from "./pages/ActivityLogPage";
import { SharedNotePage } from "./pages/SharedNotePage";

/**
 * AppLayout must live *inside* <Router> so it can call useLocation().
 * It hides the Navbar on /shared/* routes so that even if a user is
 * already logged in, they see a clean read-only view with no navigation.
 */
function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const theme = useUiStore((s) => s.theme);
  const rateLimited = useUiStore((s) => s.rateLimited);
  const location = useLocation();

  // /shared/* is a fully public, isolated read-only page — no app chrome
  const isSharedRoute = location.pathname.startsWith("/shared/");

  // Sync persisted theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Navbar is visible everywhere except shared note pages */}
      {!isSharedRoute && <Navbar />}

      {/* Rate limit overlay */}
      {rateLimited && <RateLimitCard />}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public shared note route — no auth, no navbar, truly read-only */}
        <Route path="/shared/:sharedId" element={<SharedNotePage />} />

        {/* Main home — all authenticated roles */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["admin", "editor", "viewer"]}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Activity log — admin only */}
        <Route
          path="/logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ActivityLogPage />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized fallback */}
        <Route
          path="/unauthorized"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
              <p className="text-5xl">🚫</p>
              <h1 className="text-2xl font-bold text-error">Unauthorized</h1>
              <p className="text-base-content/50">
                You don't have permission to view this page.
              </p>
              <a href="/" className="btn btn-primary btn-sm">
                Go Home
              </a>
            </div>
          }
        />

        {/* Default → home or login */}
        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/login"} replace />}
        />
      </Routes>

      {/* react-hot-toast global toaster */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
