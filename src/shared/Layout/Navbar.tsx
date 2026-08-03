import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutThunk } from "../../modules/login/Features/authThunk";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3.5 dark:border-slate-700 dark:bg-slate-800">
      <span className="text-[1.0625rem] font-semibold tracking-tight">
        Dashboard Ayto
      </span>

      <div className="flex items-center gap-3.5">
        {/* El usuario puede no estar cargado si la sesion se rehidrato solo del
            token: entonces no hay nombre que mostrar, pero la sesion es valida. */}
        {user && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {user.name}
          </span>
        )}
        <button
          className="rounded-md border border-slate-300 px-3 py-1.5 text-[0.8125rem] font-medium transition hover:border-brand-600 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600 dark:border-slate-600 dark:hover:border-brand-400 dark:hover:text-brand-400"
          type="button"
          onClick={() => dispatch(logoutThunk())}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
