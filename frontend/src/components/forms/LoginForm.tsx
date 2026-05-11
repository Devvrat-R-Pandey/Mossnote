// components/auth/LoginForm.tsx
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { emailValidation, passwordValidation } from "../../utils/validation";

interface LoginFormInputs {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate = useNavigate();

  // Clear any stale error from a previous session or failed attempt
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = useCallback(
    async (data: LoginFormInputs) => {
      clearError();
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      if (user) {
        toast.success(`Welcome back, ${user.name ?? user.email}! 👋`);
        navigate("/", { replace: true });
      }
    },
    [login, clearError, navigate],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-danger-light border border-danger/20 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-txt mb-1.5">
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-txt placeholder:text-txt-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            errors.email ? "border-danger" : "border-border"
          }`}
          {...register("email", emailValidation)}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-txt mb-1.5">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-txt placeholder:text-txt-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            errors.password ? "border-danger" : "border-border"
          }`}
          {...register("password", passwordValidation)}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
};
