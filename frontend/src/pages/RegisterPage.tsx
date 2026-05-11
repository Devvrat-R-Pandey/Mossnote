import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/forms/RegisterForm";
import { useAuthStore } from "../store/authStore";

export const RegisterPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8 animate-fade-in">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-lg">
        <div className="text-center mb-6">
          <img
            src="/Mossnote.png"
            alt="Mossnote"
            className="mx-auto h-12 w-auto object-contain mb-3"
            draggable={false}
          />
          <p className="mt-1 text-sm text-txt-secondary">Create a new account</p>
        </div>

        <div className="h-px bg-border mb-5" />

        <RegisterForm />

        <p className="mt-5 text-center text-sm text-txt-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
