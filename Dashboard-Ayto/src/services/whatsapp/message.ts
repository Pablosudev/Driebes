// Fontaneria compartida por los formatters de cada modulo.
//
// Sigue sin conocer eventos, noticias ni ofertas: el modulo pasa la ruta de su
// recurso y aqui solo se compone texto.

/**
 * Normaliza un campo antes de escribirlo en el mensaje. La API puede devolver
 * null y el mensaje va tal cual a un grupo de vecinos: nunca debe colar un
 * "null" ni un "undefined".
 */
export const clean = (value: string | null | undefined): string =>
  value?.trim() ?? "";

/** Une los bloques del mensaje descartando los que hayan quedado vacios. */
export const joinBlocks = (...blocks: string[]): string =>
  blocks.filter(Boolean).join("\n\n");

/**
 * El bloque de enlace, solo si el despliegue tiene web publica configurada.
 * `path` es la ruta del recurso en esa web, por ejemplo "/noticias/12".
 */
export const publicLink = (path: string): string => {
  const base = clean(import.meta.env.VITE_PUBLIC_SITE_URL);
  if (!base) return "";

  return `Más información:\n${base.replace(/\/$/, "")}${path}`;
};
