import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

/**
 * Tests de integración para la gestión CRUD de Noticias.
 * Contrato basado en docs/openapi.yaml.
 *
 * Modelo Noticia:
 *  - id: number (autoincremental)
 *  - titulo: string (requerido)
 *  - descripcion: string (requerido)
 *  - imagen: string | null (opcional)
 *  - fechaSubida: string date-time (autogenerada)
 *
 * Las peticiones de creación/actualización usan multipart/form-data
 * (campos de texto vía .field(), imagen opcional vía .attach()).
 */

// Helper: crea una noticia válida y devuelve la respuesta.
async function crearNoticia(
  titulo = 'Corte de agua el lunes',
  descripcion = 'El suministro estará cortado de 9h a 14h en la calle Mayor.',
) {
  return request(app)
    .post('/noticias')
    .field('titulo', titulo)
    .field('descripcion', descripcion);
}

describe('Noticias - CRUD', () => {
  describe('POST /noticias', () => {
    it('crea una noticia y devuelve 201 con el recurso creado', async () => {
      const res = await crearNoticia();

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        titulo: 'Corte de agua el lunes',
        descripcion: 'El suministro estará cortado de 9h a 14h en la calle Mayor.',
      });
      expect(typeof res.body.id).toBe('number');
      expect(res.body.fechaSubida).toBeDefined();
    });

    it('permite subir una imagen opcional', async () => {
      const res = await request(app)
        .post('/noticias')
        .field('titulo', 'Noticia con imagen')
        .field('descripcion', 'Descripción de prueba')
        .attach('imagen', Buffer.from('fake-image-content'), 'foto.png');

      expect(res.status).toBe(201);
      expect(res.body.imagen).toBeTruthy();
    });

    it('devuelve 400 si falta el titulo', async () => {
      const res = await request(app)
        .post('/noticias')
        .field('descripcion', 'Sin titulo');

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta la descripcion', async () => {
      const res = await request(app)
        .post('/noticias')
        .field('titulo', 'Sin descripcion');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /noticias', () => {
    it('devuelve 200 y un array de noticias', async () => {
      await crearNoticia();

      const res = await request(app).get('/noticias');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /noticias/:id', () => {
    it('devuelve 200 y la noticia solicitada', async () => {
      const creada = await crearNoticia('Noticia concreta', 'Contenido');

      const res = await request(app).get(`/noticias/${creada.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creada.body.id);
      expect(res.body.titulo).toBe('Noticia concreta');
    });

    it('devuelve 404 si la noticia no existe', async () => {
      const res = await request(app).get('/noticias/999999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /noticias/:id', () => {
    it('actualiza una noticia existente y devuelve 200', async () => {
      const creada = await crearNoticia('Titulo original', 'Descripcion original');

      const res = await request(app)
        .put(`/noticias/${creada.body.id}`)
        .field('titulo', 'Titulo actualizado')
        .field('descripcion', 'Descripcion actualizada');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creada.body.id);
      expect(res.body.titulo).toBe('Titulo actualizado');
      expect(res.body.descripcion).toBe('Descripcion actualizada');
    });

    it('devuelve 400 si los datos son inválidos', async () => {
      const creada = await crearNoticia();

      const res = await request(app)
        .put(`/noticias/${creada.body.id}`)
        .field('descripcion', 'Falta el titulo');

      expect(res.status).toBe(400);
    });

    it('devuelve 404 si la noticia no existe', async () => {
      const res = await request(app)
        .put('/noticias/999999')
        .field('titulo', 'No existe')
        .field('descripcion', 'No existe');

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /noticias/:id', () => {
    it('elimina una noticia existente y devuelve 204', async () => {
      const creada = await crearNoticia();

      const res = await request(app).delete(`/noticias/${creada.body.id}`);

      expect(res.status).toBe(204);

      // Tras eliminarla, ya no debe encontrarse.
      const verificacion = await request(app).get(`/noticias/${creada.body.id}`);
      expect(verificacion.status).toBe(404);
    });

    it('devuelve 404 si la noticia no existe', async () => {
      const res = await request(app).delete('/noticias/999999');

      expect(res.status).toBe(404);
    });
  });
});
