import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import MenuSide from "./MenuSide";
import Navbar from "./Navbar";

export default function Layout() {
  const token = useAppSelector((state) => state.auth.token);

  // Este layout envuelve todas las rutas privadas, asi que es el sitio natural
  // para la guarda de sesion. El token se rehidrata de localStorage, de modo
  // que un refresco no expulsa al usuario al login.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr]">
      <Navbar />
      <div className="grid min-h-0 grid-cols-1 md:grid-cols-[14rem_1fr]">
        <MenuSide />
        <main className="min-w-0 px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
