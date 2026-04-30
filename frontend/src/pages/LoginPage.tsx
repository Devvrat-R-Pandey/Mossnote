// pages/LoginPage.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/forms/LoginForm";
import { useAuthStore } from "../store/authStore";

export const LoginPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Already logged in → go to home (redirect is also triggered in LoginForm after toast)
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-[calc(100dvh-64px)] bg-base-200 px-4 animate-fade-in">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-2 p-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold">📝 Mossnote</h1>
            <p className="text-base-content/50 text-sm">Sign in to your account</p>
          </div>

          <div className="divider my-0" />

          <LoginForm />

          <p className="text-center text-sm text-base-content/60">
            Don't have an account?{" "}
            <Link to="/register" className="link link-primary font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};