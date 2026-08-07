import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { meThunk } from "../../modules/login/Features/authThunk";

/**
 * Guarda de rutas: sin token en el store, al login.
 *
 * El token se rehidrata de localStorage al crear el slice, asi que un F5 con
 * sesion abierta no expulsa al usuario. Se guarda la ruta de origen en el state
 * de navegacion para poder devolverlo donde estaba tras iniciar sesion.
 */
export const RequireAuth = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  // Tras un F5 hay token pero no usuario: se recupera de la API. Si el token ya
  // no vale, meThunk limpia la sesion y este mismo componente redirige al login.
  useEffect(() => {
    if (token && !user) {
      dispatch(meThunk());
    }
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};