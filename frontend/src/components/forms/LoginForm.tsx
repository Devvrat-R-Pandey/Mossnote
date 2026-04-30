// components/auth/LoginForm.tsx
import { useCallback } from "react";
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
    [login, clearError, navigate]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      {error && (
        <div className="alert alert-error py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <label className="label py-0.5">
          <span className="label-text font-medium text-sm">Email</span>
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          className={`input input-bordered input-sm w-full ${errors.email ? "input-error" : ""}`}
          {...register("email", emailValidation)}
        />
        {errors.email && (
          <label className="label py-0">
            <span className="label-text-alt text-error">{errors.email.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label py-0.5">
          <span className="label-text font-medium text-sm">Password</span>
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className={`input input-bordered input-sm w-full ${errors.password ? "input-error" : ""}`}
          {...register("password", passwordValidation)}
        />
        {errors.password && (
          <label className="label py-0">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-sm w-full mt-1"
      >
        {loading ? <span className="loading loading-spinner loading-sm" /> : "Login"}
      </button>
    </form>
  );
};
