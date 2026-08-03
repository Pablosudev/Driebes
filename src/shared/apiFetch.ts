// Acceso al token y wrapper de fetch para toda la API.
//
// Antes cada thunk componia la URL a mano y ninguno enviaba la cabecera
// Authorization, asi que cualquier endpoint protegido respondia 401. Aqui se
// centralizan las dos cosas: la base de la URL y el token.

const TOKEN_KEY = "dashboard.token";

/** Lee el token persistido. Devuelve null si no hay sesion guardada. */
export const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    // localStorage puede lanzar en modo privado o si esta deshabilitado.
    return null;
  }
};

/** Persiste el token para que la sesion sobreviva a un refresco de pagina. */
export const saveToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Sin persistencia la sesion sigue viva en memoria, no es fatal.
  }
};

/** Borra el token persistido. Se llama al cerrar sesion. */
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Idem: si no se puede borrar, el estado de Redux ya se ha limpiado.
  }
};

/**
 * Llama a la API resolviendo la URL base y adjuntando el token si existe.
 *
 * `path` es la ruta relativa, empezando por barra: apiFetch("/bookings").
 * No fija Content-Type: quien envie JSON lo pasa en `init.headers`, y quien
 * envie FormData debe omitirlo para que el navegador ponga el boundary.
 */
export const apiFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = readToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${import.meta.env.VITE_API_URL}${path}`, { ...init, headers });
};
