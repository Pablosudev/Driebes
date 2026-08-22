import fs from 'node:fs';
import path from 'node:path';
import formidable from 'formidable';

// Raíz donde se guardan las imágenes subidas. app.ts sirve esta carpeta como
// estáticos en /uploads, sin autenticación: un <img src> del navegador no puede
// enviar la cabecera Authorization.
// UPLOADS_DIR permite reubicarla; los tests la mandan al temporal del sistema
// para no ir dejando ficheros sueltos en el repositorio.
export const UPLOADS_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.resolve(process.cwd(), 'uploads');

/**
 * Parser de multipart que deja el fichero ya guardado en uploads/<carpeta>.
 * Antes formidable lo dejaba en el temporal del sistema y nadie lo movía, así
 * que la URL guardada en base de datos apuntaba a un fichero inexistente.
 */
export function createUploadForm(carpeta: string) {
  const uploadDir = path.join(UPLOADS_ROOT, carpeta);
  fs.mkdirSync(uploadDir, { recursive: true });

  // keepExtensions conserva la extensión; el nombre lo genera formidable
  // (aleatorio), de modo que dos subidas llamadas "foto.jpg" no se pisan.
  return formidable({ multiples: false, uploadDir, keepExtensions: true });
}

/** URL pública del fichero subido, o null si la petición no traía imagen. */
export function rutaPublica(
  carpeta: string,
  file: { newFilename: string } | undefined | null,
): string | null {
  return file ? `/uploads/${carpeta}/${file.newFilename}` : null;
}

const PREFIJO_PUBLICO = '/uploads/';

/**
 * Borra del disco la imagen a la que apunta una URL pública de /uploads.
 * No lanza nunca: un fichero que se resiste no debe convertirse en un 500.
 */
export async function eliminarImagen(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(PREFIJO_PUBLICO)) return;

  // El destino tiene que caer dentro de UPLOADS_ROOT, para que un valor
  // manipulado ('/uploads/../../algo') no alcance ficheros ajenos.
  const destino = path.resolve(UPLOADS_ROOT, url.slice(PREFIJO_PUBLICO.length));
  if (!destino.startsWith(UPLOADS_ROOT + path.sep)) return;

  try {
    await fs.promises.rm(destino, { force: true });
  } catch {
    /* el fichero se queda en disco, pero la respuesta no se rompe */
  }
}
