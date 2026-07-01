import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

async function createEvent(
  title = 'Feria de verano',
  category = 'sports',
  description = 'Celebración anual de la feria del pueblo.',
  eventDate = '2026-08-15T18:00:00Z',
) {
  return request(app)
    .post('/events')
    .field('title', title)
    .field('description', description)
    .field('eventDate', eventDate)
    .field('category', category);
}

describe('Events', () => {
  describe('POST /events', () => {
    it('crea un evento y devuelve 201 con el recurso creado', async () => {
      const res = await createEvent('Feria de verano', 'festive');

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Feria de verano',
        category: 'festive',
      });
      expect(typeof res.body.id).toBe('number');
      expect(res.body.creationDate).toBeDefined();
    });

    it('permite subir una imagen opcional', async () => {
      const res = await request(app)
        .post('/events')
        .field('title', 'Evento con imagen')
        .field('description', 'Descripción de prueba')
        .field('eventDate', '2026-08-15T18:00:00Z')
        .field('category', 'sports')
        .attach('image', Buffer.from('fake-image-content'), 'foto.png');

      expect(res.status).toBe(201);
      expect(res.body.image).toBeTruthy();
    });

    it('devuelve 400 si falta el title', async () => {
      const res = await request(app)
        .post('/events')
        .field('description', 'Sin title')
        .field('eventDate', '2026-08-15T18:00:00Z')
        .field('category', 'sports');

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta la description', async () => {
      const res = await request(app)
        .post('/events')
        .field('title', 'Sin description')
        .field('eventDate', '2026-08-15T18:00:00Z')
        .field('category', 'sports');

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta eventDate', async () => {
      const res = await request(app)
        .post('/events')
        .field('title', 'Sin fecha')
        .field('description', 'Descripción')
        .field('category', 'sports');

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta category', async () => {
      const res = await request(app)
        .post('/events')
        .field('title', 'Sin categoría')
        .field('description', 'Descripción')
        .field('eventDate', '2026-08-15T18:00:00Z');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /events', () => {
    it('devuelve 200 y un array de eventos', async () => {
      await createEvent();

      const res = await request(app).get('/events');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('responde en formato JSON', async () => {
      const res = await request(app).get('/events');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('cada evento del listado incluye los campos del modelo', async () => {
      const creado = await createEvent('Con forma', 'sports');

      const res = await request(app).get('/events');
      const evento = res.body.find((e: { id: number }) => e.id === creado.body.id);

      expect(evento).toBeDefined();
      expect(typeof evento.id).toBe('number');
      expect(typeof evento.title).toBe('string');
      expect(typeof evento.description).toBe('string');
      expect(evento).toHaveProperty('image');
      expect(evento.creationDate).toBeDefined();
      expect(evento.eventDate).toBeDefined();
      expect(typeof evento.category).toBe('string');
    });

    it('incluye un evento recién creado con sus datos', async () => {
      const creado = await createEvent('Maratón popular', 'sports');

      const res = await request(app).get('/events');
      const evento = res.body.find((e: { id: number }) => e.id === creado.body.id);

      expect(evento).toMatchObject({
        id: creado.body.id,
        title: 'Maratón popular',
        category: 'sports',
      });
    });

    it('filtra por categoría con ?category=', async () => {
      const deportivo = await createEvent('Liga local', 'sports');
      const festivo = await createEvent('Fiestas patronales', 'festive');

      const res = await request(app).get('/events?category=sports');
      const ids = res.body.map((e: { id: number }) => e.id);

      expect(res.status).toBe(200);
      expect(ids).toContain(deportivo.body.id);
      expect(ids).not.toContain(festivo.body.id);
      expect(res.body.every((e: { category: string }) => e.category === 'sports')).toBe(true);
    });
  });

  describe('GET /events/:id', () => {
    it('devuelve 200 y el evento solicitado', async () => {
      const creado = await createEvent('Evento concreto', 'sports');

      const res = await request(app).get(`/events/${creado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creado.body.id);
      expect(res.body.title).toBe('Evento concreto');
      expect(res.body.category).toBe('sports');
    });

    it('responde en formato JSON', async () => {
      const creado = await createEvent();

      const res = await request(app).get(`/events/${creado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('el evento devuelto incluye todos los campos del modelo', async () => {
      const creado = await createEvent('Con forma', 'sports');

      const res = await request(app).get(`/events/${creado.body.id}`);

      expect(typeof res.body.id).toBe('number');
      expect(typeof res.body.title).toBe('string');
      expect(typeof res.body.description).toBe('string');
      expect(res.body).toHaveProperty('image'); // string | null
      expect(res.body.creationDate).toBeDefined();
      expect(res.body.eventDate).toBeDefined();
      expect(typeof res.body.category).toBe('string');
    });

    it('devuelve el evento correcto cuando hay varios', async () => {
      await createEvent('Primero', 'sports');
      const segundo = await createEvent('Segundo', 'festive');

      const res = await request(app).get(`/events/${segundo.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(segundo.body.id);
      expect(res.body.title).toBe('Segundo');
    });

    it('devuelve 404 si el evento no existe', async () => {
      const res = await request(app).get('/events/999999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /events/:id', () => {
    it('actualiza un evento existente y devuelve 200', async () => {
      const creado = await createEvent('Título original', 'sports');

      const res = await request(app)
        .put(`/events/${creado.body.id}`)
        .field('title', 'Título actualizado')
        .field('description', 'Descripción actualizada')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'festive');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creado.body.id);
      expect(res.body.title).toBe('Título actualizado');
      expect(res.body.description).toBe('Descripción actualizada');
      expect(res.body.category).toBe('festive');
    });

    it('persiste el cambio (un GET posterior devuelve los datos actualizados)', async () => {
      const creado = await createEvent('Antes', 'sports');

      await request(app)
        .put(`/events/${creado.body.id}`)
        .field('title', 'Después')
        .field('description', 'Contenido después')
        .field('eventDate', '2026-10-01T10:00:00Z')
        .field('category', 'religious');

      const res = await request(app).get(`/events/${creado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Después');
      expect(res.body.description).toBe('Contenido después');
      expect(res.body.category).toBe('religious');
    });

    it('responde en formato JSON', async () => {
      const creado = await createEvent();

      const res = await request(app)
        .put(`/events/${creado.body.id}`)
        .field('title', 'Editado')
        .field('description', 'Editado')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'sports');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('devuelve 400 si los datos son inválidos', async () => {
      const creado = await createEvent();

      const res = await request(app)
        .put(`/events/${creado.body.id}`)
        .field('description', 'Falta el title')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'sports');

      expect(res.status).toBe(400);
    });

    it('devuelve 404 si el evento no existe', async () => {
      const res = await request(app)
        .put('/events/999999')
        .field('title', 'No existe')
        .field('description', 'No existe')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'sports');

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /events/:id', () => {
    it('elimina un evento existente y devuelve 204', async () => {
      const creado = await createEvent();

      const res = await request(app).delete(`/events/${creado.body.id}`);

      expect(res.status).toBe(204);

      // Tras eliminarlo, ya no debe encontrarse.
      const verificacion = await request(app).get(`/events/${creado.body.id}`);
      expect(verificacion.status).toBe(404);
    });

    it('el evento eliminado desaparece del listado', async () => {
      const creado = await createEvent('Para borrar', 'sports');

      await request(app).delete(`/events/${creado.body.id}`);

      const res = await request(app).get('/events');
      const ids = res.body.map((e: { id: number }) => e.id);
      expect(ids).not.toContain(creado.body.id);
    });

    it('no afecta a otros eventos', async () => {
      const aBorrar = await createEvent('A borrar', 'sports');
      const superviviente = await createEvent('Superviviente', 'festive');

      await request(app).delete(`/events/${aBorrar.body.id}`);

      const res = await request(app).get(`/events/${superviviente.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(superviviente.body.id);
    });

    it('devuelve 404 si el evento no existe', async () => {
      const res = await request(app).delete('/events/999999');

      expect(res.status).toBe(404);
    });
  });
});
