// components/forms/RegisterForm.tsx
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { emailValidation, passwordValidation, nameValidation } from "../../utils/validation";

// Role is intentionally omitted - the backend assigns "editor" by default.
// Admin accounts are created through a controlled server-side process.
interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
}

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const register_user        = useAuthStore((s) => s.register);
  const loading              = useAuthStore((s) => s.loading);
  const error                = useAuthStore((s) => s.error);
  const registerSuccess      = useAuthStore((s) => s.registerSuccess);
  const clearRegisterSuccess = useAuthStore((s) => s.clearRegisterSuccess);
  const clearError           = useAuthStore((s) => s.clearError);
  const navigate             = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({ mode: "onChange" });

  // Clear stale errors from a previous attempt on mount
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!registerSuccess) return;
    toast.success("Account created! Please log in. ✅");
    const timer = setTimeout(() => {
      clearRegisterSuccess();
      navigate("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [registerSuccess, clearRegisterSuccess, navigate]);

  const onSubmit = useCallback(
    async (data: RegisterFormInputs) => {
      clearError();
      // No role is passed - the store and backend both default to "editor"
      await register_user(data.email, data.password, data.name);
    },
    [register_user, clearError]
  );

  // ── Success state ──────────────────────────────────────────────────────────
  if (registerSuccess) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-4xl">✅</p>
        <p className="text-lg font-semibold text-success">Registration Successful!</p>
        <p className="text-sm text-txt-secondary">Redirecting you to login page...</p>
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-surface px-3 py-2 text-sm text-txt placeholder:text-txt-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
      hasError ? "border-danger" : "border-border"
    }`;

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Global error banner */}
      {error && (
        <div className="rounded-lg bg-danger-light border border-danger/20 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-txt mb-1.5">Name</label>
        <input
          type="text"
          placeholder="Your name"
          className={inputClass(!!errors.name)}
          {...register("name", nameValidation)}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-txt mb-1.5">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          className={inputClass(!!errors.email)}
          {...register("email", emailValidation)}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
        )}
      </div>

      {/* Password — with Eye/EyeOff visibility toggle */}
      <div>
        <label className="block text-sm font-medium text-txt mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`${inputClass(!!errors.password)} pr-10`}
            {...register("password", passwordValidation)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-txt-tertiary hover:text-txt transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      {/* Primary CTA */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
};
