import { Router } from 'express';
import formidable from 'formidable';
import { CrearNoticiaUseCase } from '../../domain/crear-noticia.use-case';
import { ValidationError } from '../../domain/errors';

// Capa de TRANSPORTE.
// Todo lo relacionado con HTTP/Express vive aquí: parseo de la petición
// (multipart/form-data), traducción de errores de dominio a códigos HTTP y
// serialización de la respuesta. No contiene reglas de negocio.

// formidable entrega los campos de texto como arrays de strings.
const primerValor = (campo: string | string[] | undefined): string | undefined =>
  Array.isArray(campo) ? campo[0] : campo;

export function crearNoticiasRouter(crearNoticia: CrearNoticiaUseCase): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'No se pudo procesar la petición' });
        return;
      }

      // La imagen es opcional; si se ha subido, guardamos una ruta de referencia.
      const archivoImagen = Array.isArray(files.imagen) ? files.imagen[0] : files.imagen;
      const imagen = archivoImagen
        ? `/uploads/noticias/${archivoImagen.originalFilename ?? archivoImagen.newFilename}`
        : null;

      try {
        const noticia = await crearNoticia.execute({
          titulo: primerValor(fields.titulo),
          descripcion: primerValor(fields.descripcion),
          imagen,
        });

        res.status(201).json(noticia);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ error: error.message });
          return;
        }
        // Al ser un callback async, un throw aquí no lo captura Express
        // (quedaría como una promesa rechazada sin gestionar), así que
        // respondemos nosotros con un 500.
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    });
  });

  return router;
}
