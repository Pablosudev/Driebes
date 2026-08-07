import { IoLogOutOutline } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutThunk } from "../../modules/login/Features/authThunk";

export default function Navbar() {
  const dispatch = useAppDispatch();
  // El nombre estaba escrito a mano; ahora sale de la sesion real.
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="flex items-center justify-end gap-4 border-b border-tertiary-200 bg-white px-6 py-3.5">
      <div className="flex items-center gap-3.5">
        <div className="text-right leading-tight">
          <p className="font-label text-label text-neutral">{user?.name ?? "…"}</p>
          <p className="font-body text-xs text-secondary-500">Administrador</p>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-tertiary-100 text-secondary-600 transition-colors hover:bg-tertiary-200 hover:text-primary"
          type="button"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          onClick={() => dispatch(logoutThunk())}
        >
          <IoLogOutOutline className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
