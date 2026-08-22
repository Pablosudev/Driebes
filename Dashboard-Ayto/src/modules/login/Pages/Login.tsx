import { useState } from "react";
import type { ReactNode, SubmitEvent } from "react";
import { Navigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { TbNews } from "react-icons/tb";
import { IoCalendarClearOutline } from "react-icons/io5";
import { MdOutlineWorkOutline } from "react-icons/md";
import { ImCalendar } from "react-icons/im";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginThunk } from "../Features/authThunk";

const inputClass =
  "w-full rounded-xl border border-tertiary-300 bg-white py-2.5 pr-3 pl-10 text-neutral placeholder:text-neutral-400 transition " +
  "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25 focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-tertiary-50 disabled:opacity-60";

const labelClass = "font-label text-label text-secondary-600";

const iconClass =
  "pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-tertiary-500";


const highlights: { icon: ReactNode; label: string }[] = [
  { icon: <TbNews className="h-4.5 w-4.5" />, label: "Noticias del municipio" },
  { icon: <IoCalendarClearOutline className="h-4.5 w-4.5" />, label: "Agenda de eventos" },
  { icon: <MdOutlineWorkOutline className="h-4.5 w-4.5" />, label: "Ofertas de empleo" },
  { icon: <ImCalendar className="h-4.5 w-4.5" />, label: "Reservas de instalaciones" },
];

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
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Panel de marca. Por debajo de lg no cabe y el escudo pasa a la tarjeta. */}
      <aside className="relative hidden overflow-hidden bg-primary-700 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Decoracion: dos halos difusos y una trama de puntos. Solo estetica. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-primary-300/35 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-28 h-96 w-96 rounded-full bg-primary-950/40 blur-3xl"
        />

        <div className="relative flex items-center gap-3.5">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/25 bg-white/95 shadow-lg">
            <img
              src="/Logo.png"
              alt="Escudo del Ayuntamiento"
              className="h-12 w-12 object-contain"
            />
          </div>
          <div className="font-label text-label tracking-wide text-primary-100 uppercase">
            Ayuntamiento
            <span className="block text-[0.9375rem] font-bold tracking-normal text-white normal-case">
              Panel de gestión
            </span>
          </div>
        </div>

        <div className="relative max-w-100">
          <p className="font-headline text-[2rem] leading-tight font-bold tracking-tight">
            Todo el municipio,
            <br />
            en un solo panel.
          </p>
          <p className="mt-3 text-primary-100">
            Publica, revisa y comparte la información del ayuntamiento sin salir
            de aquí.
          </p>

          <ul className="mt-8 flex list-none flex-col gap-3 p-0">
            {highlights.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
                  {item.icon}
                </span>
                <span className="text-sm text-primary-50">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-label text-label text-primary-200">
          Acceso restringido al personal autorizado.
        </p>
      </aside>

      <main className="relative grid place-items-center overflow-hidden px-6 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-primary-100/70 blur-3xl"
        />

        <div className="relative w-full max-w-100 rounded-3xl border border-tertiary-200 bg-white p-8 shadow-[0_24px_60px_-32px_rgba(29,29,31,0.35)]">
          <header className="mb-7">
            <img
              src="/Logo.png"
              alt="Escudo del Ayuntamiento"
              className="mb-4 h-14 w-14 object-contain lg:hidden"
            />
            <h1 className="font-headline text-[1.5rem] leading-tight font-bold tracking-tight">
              Gestión Municipal
            </h1>
            <p className="mt-1.5 text-sm text-secondary-500">
              Accede con tus credenciales de gestor.
            </p>
            <span
              aria-hidden
              className="mt-4 block h-0.5 w-10 rounded-full bg-primary"
            />
          </header>

          <form className="flex flex-col gap-4.5" onSubmit={handleSubmit} noValidate>
            {/* role="alert" para que un lector de pantalla anuncie el fallo. */}
            {error && (
              <p
                className="rounded-xl border border-danger-100 bg-danger-50 px-3 py-2.5 text-sm text-danger-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative flex">
                <FiMail aria-hidden className={iconClass} />
                <input
                  className={inputClass}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@ayuntamiento.es"
                  autoComplete="username"
                  required
                  disabled={isPending}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="password">
                Contraseña
              </label>
              <div className="relative flex">
                <FiLock aria-hidden className={iconClass} />
                <input
                  className={`${inputClass} pr-11`}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {/* Icono con aria-label: el nombre accesible sigue siendo el verbo. */}
                <button
                  className="absolute top-1/2 right-1.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-tertiary-600 transition hover:bg-tertiary-100 hover:text-primary focus-visible:ring-3 focus-visible:ring-primary/25 focus-visible:outline-none"
                  type="button"
                  disabled={isPending}
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <FiEyeOff aria-hidden className="h-4.5 w-4.5" />
                  ) : (
                    <FiEye aria-hidden className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            <button
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-white shadow-lg shadow-primary/25 transition hover:bg-primary-600 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
              type="submit"
              disabled={!isComplete || isPending}
            >
              {isPending && (
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {isPending ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 border-t border-tertiary-200 pt-5 text-center font-label text-label text-secondary-400">
            ¿Problemas para acceder? Avisa al administrador del portal.
          </p>
        </div>
      </main>
    </div>
  );
};
