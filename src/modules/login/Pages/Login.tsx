import { useState } from "react";
import type { SubmitEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginThunk } from "../Features/authThunk";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-800 transition " +
  "focus-visible:border-brand-600 focus-visible:ring-3 focus-visible:ring-brand-600/25 focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:border-brand-400";

const labelClass =
  "text-[0.8125rem] font-medium text-slate-500 dark:text-slate-400";

export const Login = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isPending = status === "pending";
  const isComplete = email.trim() !== "" && password !== "";

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete || isPending) {
      return;
    }
    dispatch(loginThunk({ email: email.trim(), password }));
  };

  // Con sesion abierta esta pantalla no tiene sentido: al dashboard.
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-100 rounded-lg border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/30">
        <header className="mb-7">
          <h1 className="text-[1.375rem] font-semibold tracking-tight">
            Dashboard Ayto
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Accede con tus credenciales de gestor.
          </p>
        </header>

        <form className="flex flex-col gap-4.5" onSubmit={handleSubmit} noValidate>
          {/* role="alert" para que un lector de pantalla anuncie el fallo. */}
          {error && (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="email">
              Correo electrónico
            </label>
            <input
              className={inputClass}
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              disabled={isPending}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="password">
              Contraseña
            </label>
            <div className="relative flex">
              <input
                className={`${inputClass} pr-18`}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isPending}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md px-2 py-1 text-[0.8125rem] font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
                type="button"
                disabled={isPending}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <button
            className="mt-1 rounded-md bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-55"
            type="submit"
            disabled={!isComplete || isPending}
          >
            {isPending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};
