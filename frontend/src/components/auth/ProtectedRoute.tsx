import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "editor" | "viewer">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // user object has a `role` property
  if (!allowedRoles.includes(user.role as "admin" | "editor" | "viewer")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
