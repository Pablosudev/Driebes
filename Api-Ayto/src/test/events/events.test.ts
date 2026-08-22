import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { UPLOADS_ROOT } from '../../utils/uploads';

const app = createApp();

// Las lecturas de eventos son públicas. Para probar las escrituras obtenemos un
// token del admin semilla y lo enviamos mediante este helper.
let bearer: string;
beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@ayto.local', password: 'admin1234' });
  bearer = `Bearer ${res.body.token}`;
});

const api = {
  post: (url: string) => request(app).post(url).set('Authorization', bearer),
  put: (url: string) => request(app).put(url).set('Authorization', bearer),
  patch: (url: string) => request(app).patch(url).set('Authorization', bearer),
  delete: (url: string) => request(app).delete(url).set('Authorization', bearer),
};

async function createEvent(
  title = 'Feria de verano',
  category = 'Deportivo',
  description = 'Celebración anual de la feria del pueblo.',
  eventDate = '2026-08-15T18:00:00Z',
) {
  return api
    .post('/events')
    .field('title', title)
    .field('description', description)
    .field('eventDate', eventDate)
    .field('category', category);
}

// '/uploads/events/abc.png' -> ruta real en disco, para comprobar si el fichero está.
const rutaEnDisco = (url: string) => path.join(UPLOADS_ROOT, url.replace(/^\/uploads\//, ''));

const ficherosSubidos = () => {
  const dir = path.join(UPLOADS_ROOT, 'events');
  return fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];
};

// Helper: crea un evento con imagen adjunta.
function crearEventoConImagen(title: string, contenido: string) {
  return api
    .post('/events')
    .field('title', title)
    .field('description', 'Contenido')
    .field('eventDate', '2026-08-15T18:00:00Z')
    .field('category', 'Festivo')
    .attach('image', Buffer.from(contenido), 'foto.png');
}

describe('Events', () => {
  describe('POST /events', () => {
    it('crea un evento y devuelve 201 con el recurso creado', async () => {
      const res = await createEvent('Feria de verano', 'Festivo');

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Feria de verano',
        category: 'Festivo',
      });
      expect(typeof res.body.id).toBe('number');
      expect(res.body.creationDate).toBeDefined();
    });

    it('permite subir una imagen opcional', async () => {
      const res = await api
        .post('/events')
        .field('title', 'Evento con imagen')
        .field('description', 'Descripción de prueba')
        .field('eventDate', '2026-08-15T18:00:00Z')
        .field('category', 'Deportivo')
        .attach('image', Buffer.from('fake-image-content'), 'foto.png');

      expect(res.status).toBe(201);
      expect(res.body.image).toBeTruthy();
    });

    it('devuelve 400 si falta el title', async () => {
      const res = await api
        .post('/events')
        .field('description', 'Sin title')
        .field('eventDate', '2026-08-15T18:00:00Z')
        .field('category', 'Deportivo');

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta la description', async () => {
      const res = await api
        .post('/events')
        .field('title', 'Sin description')
        .field('eventDate', '2026-08-15T18:00:00Z')
        .field('category', 'Deportivo');

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta eventDate', async () => {
      const res = await api
        .post('/events')
        .field('title', 'Sin fecha')
        .field('description', 'Descripción')
        .field('category', 'Deportivo');

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta category', async () => {
      const res = await api
        .post('/events')
        .field('title', 'Sin categoría')
        .field('description', 'Descripción')
        .field('eventDate', '2026-08-15T18:00:00Z');

      expect(res.status).toBe(400);
    });

    it('no deja la imagen en disco si la validación falla', async () => {
      const antes = ficherosSubidos();

      const res = await api
        .post('/events')
        .field('description', 'Falta el title')
        .field('eventDate', '2026-08-15T18:00:00Z')
        .field('category', 'Deportivo')
        .attach('image', Buffer.from('fake-image-content'), 'huerfana.png');

      expect(res.status).toBe(400);
      expect(ficherosSubidos()).toEqual(antes);
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
      const creado = await createEvent('Con forma', 'Deportivo');

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
      const creado = await createEvent('Maratón popular', 'Deportivo');

      const res = await request(app).get('/events');
      const evento = res.body.find((e: { id: number }) => e.id === creado.body.id);

      expect(evento).toMatchObject({
        id: creado.body.id,
        title: 'Maratón popular',
        category: 'Deportivo',
      });
    });

    it('filtra por categoría con ?category=', async () => {
      const deportivo = await createEvent('Liga local', 'Deportivo');
      const festivo = await createEvent('Fiestas patronales', 'Festivo');

      const res = await request(app).get('/events?category=Deportivo');
      const ids = res.body.map((e: { id: number }) => e.id);

      expect(res.status).toBe(200);
      expect(ids).toContain(deportivo.body.id);
      expect(ids).not.toContain(festivo.body.id);
      expect(res.body.every((e: { category: string }) => e.category === 'Deportivo')).toBe(true);
    });
  });

  describe('GET /events/:id', () => {
    it('devuelve 200 y el evento solicitado', async () => {
      const creado = await createEvent('Evento concreto', 'Deportivo');

      const res = await request(app).get(`/events/${creado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creado.body.id);
      expect(res.body.title).toBe('Evento concreto');
      expect(res.body.category).toBe('Deportivo');
    });

    it('responde en formato JSON', async () => {
      const creado = await createEvent();

      const res = await request(app).get(`/events/${creado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('el evento devuelto incluye todos los campos del modelo', async () => {
      const creado = await createEvent('Con forma', 'Deportivo');

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
      await createEvent('Primero', 'Deportivo');
      const segundo = await createEvent('Segundo', 'Festivo');

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
      const creado = await createEvent('Título original', 'Deportivo');

      const res = await api
        .put(`/events/${creado.body.id}`)
        .field('title', 'Título actualizado')
        .field('description', 'Descripción actualizada')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'Festivo');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creado.body.id);
      expect(res.body.title).toBe('Título actualizado');
      expect(res.body.description).toBe('Descripción actualizada');
      expect(res.body.category).toBe('Festivo');
    });

    it('persiste el cambio (un GET posterior devuelve los datos actualizados)', async () => {
      const creado = await createEvent('Antes', 'Deportivo');

      await api
        .put(`/events/${creado.body.id}`)
        .field('title', 'Después')
        .field('description', 'Contenido después')
        .field('eventDate', '2026-10-01T10:00:00Z')
        .field('category', 'Religioso');

      const res = await request(app).get(`/events/${creado.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Después');
      expect(res.body.description).toBe('Contenido después');
      expect(res.body.category).toBe('Religioso');
    });

    it('responde en formato JSON', async () => {
      const creado = await createEvent();

      const res = await api
        .put(`/events/${creado.body.id}`)
        .field('title', 'Editado')
        .field('description', 'Editado')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'Deportivo');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('devuelve 400 si los datos son inválidos', async () => {
      const creado = await createEvent();

      const res = await api
        .put(`/events/${creado.body.id}`)
        .field('description', 'Falta el title')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'Deportivo');

      expect(res.status).toBe(400);
    });

    it('devuelve 404 si el evento no existe', async () => {
      const res = await api
        .put('/events/999999')
        .field('title', 'No existe')
        .field('description', 'No existe')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'Deportivo');

      expect(res.status).toBe(404);
    });

    it('al reemplazar la imagen borra la anterior del disco', async () => {
      const creado = await crearEventoConImagen('Imagen original', 'imagen-original');

      const anterior = rutaEnDisco(creado.body.image);
      expect(fs.existsSync(anterior)).toBe(true);

      const res = await api
        .put(`/events/${creado.body.id}`)
        .field('title', 'Imagen nueva')
        .field('description', 'Contenido')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'Festivo')
        .attach('image', Buffer.from('imagen-nueva'), 'nueva.png');

      expect(res.status).toBe(200);
      expect(res.body.image).not.toBe(creado.body.image);
      expect(fs.existsSync(anterior)).toBe(false);
      expect(fs.existsSync(rutaEnDisco(res.body.image))).toBe(true);
    });

    it('conserva la imagen si la actualización no trae una nueva', async () => {
      const creado = await crearEventoConImagen('Imagen a conservar', 'fake-image-content');

      const res = await api
        .put(`/events/${creado.body.id}`)
        .field('title', 'Solo cambia el texto')
        .field('description', 'Contenido nuevo')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'Festivo');

      expect(res.status).toBe(200);
      expect(res.body.image).toBe(creado.body.image);
      expect(fs.existsSync(rutaEnDisco(creado.body.image))).toBe(true);
    });

    it('no deja la imagen en disco si la validación falla', async () => {
      const creado = await createEvent();
      const antes = ficherosSubidos();

      const res = await api
        .put(`/events/${creado.body.id}`)
        .field('description', 'Falta el title')
        .field('eventDate', '2026-09-20T18:00:00Z')
        .field('category', 'Deportivo')
        .attach('image', Buffer.from('fake-image-content'), 'huerfana.png');

      expect(res.status).toBe(400);
      expect(ficherosSubidos()).toEqual(antes);
    });
  });

  describe('DELETE /events/:id', () => {
    it('elimina un evento existente y devuelve 204', async () => {
      const creado = await createEvent();

      const res = await api.delete(`/events/${creado.body.id}`);

      expect(res.status).toBe(204);

      // Tras eliminarlo, ya no debe encontrarse.
      const verificacion = await request(app).get(`/events/${creado.body.id}`);
      expect(verificacion.status).toBe(404);
    });

    it('el evento eliminado desaparece del listado', async () => {
      const creado = await createEvent('Para borrar', 'Deportivo');

      await api.delete(`/events/${creado.body.id}`);

      const res = await request(app).get('/events');
      const ids = res.body.map((e: { id: number }) => e.id);
      expect(ids).not.toContain(creado.body.id);
    });

    it('no afecta a otros eventos', async () => {
      const aBorrar = await createEvent('A borrar', 'Deportivo');
      const superviviente = await createEvent('Superviviente', 'Festivo');

      await api.delete(`/events/${aBorrar.body.id}`);

      const res = await request(app).get(`/events/${superviviente.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(superviviente.body.id);
    });

    it('borra también la imagen del disco', async () => {
      const creado = await crearEventoConImagen('Evento con imagen a borrar', 'fake-image-content');

      const enDisco = rutaEnDisco(creado.body.image);
      expect(fs.existsSync(enDisco)).toBe(true);

      const res = await api.delete(`/events/${creado.body.id}`);

      expect(res.status).toBe(204);
      expect(fs.existsSync(enDisco)).toBe(false);
    });

    it('devuelve 204 aunque el evento no tuviera imagen', async () => {
      const creado = await createEvent('Sin imagen', 'Otro');

      const res = await api.delete(`/events/${creado.body.id}`);

      expect(res.status).toBe(204);
    });

    it('devuelve 404 si el evento no existe', async () => {
      const res = await api.delete('/events/999999');

      expect(res.status).toBe(404);
    });
  });
});
