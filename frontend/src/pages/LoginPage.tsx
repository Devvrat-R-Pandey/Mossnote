import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/forms/LoginForm";
import { useAuthStore } from "../store/authStore";

export const LoginPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg">
        <div className="text-center mb-6">
          <img
            src="/Mossnote.png"
            alt="Mossnote"
            className="mx-auto h-12 w-auto object-contain mb-3"
            draggable={false}
          />
          <p className="mt-1 text-sm text-txt-secondary">Sign in to your account</p>
        </div>

        <div className="h-px bg-border mb-5" />

        <LoginForm />

        <p className="mt-5 text-center text-sm text-txt-secondary">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
