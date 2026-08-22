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
/**
 * Convierte una ruta devuelta por la API en una URL absoluta.
 *
 * Las imagenes se guardan como "/uploads/news/xxx.jpg": si eso se mete tal cual
 * en un <img src>, el navegador la resuelve contra el origen del dashboard y no
 * contra el de la API, asi que la peticion acaba en 404.
 */
export const mediaUrl = (path: string | null): string | undefined => {
  if (!path) return undefined;
  // Por si algun dia la API devuelve la URL ya completa (p. ej. un CDN).
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.VITE_API_URL}${path}`;
};

export const apiFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = readToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${import.meta.env.VITE_API_URL}${path}`, { ...init, headers });
};
