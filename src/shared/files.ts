/**
 * Descarga una URL y la envuelve en un File, listo para adjuntar al compartir.
 *
 * Devuelve null ante cualquier problema en lugar de lanzar: quien comparte
 * siempre tiene la via alternativa del enlace, y quedarse sin foto no debe
 * impedir el envio.
 */
export async function urlToFile(url: string | undefined): Promise<File | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    const name = url.split("?")[0].split("/").pop() || "imagen";

    return new File([blob], name, { type: blob.type || "image/png" });
  } catch {
    // Sin conexion, CORS o la API caida.
    return null;
  }
}
