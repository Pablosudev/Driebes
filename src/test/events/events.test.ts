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
});
