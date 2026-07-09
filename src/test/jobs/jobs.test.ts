import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

/**
 * Tests de integración (TDD) para la creación de Ofertas de trabajo.
 * Contrato basado en docs/0001-diseno-api.md, sección 5.
 *
 * Modelo Job (oferta de trabajo):
 *  - id: number (autoincremental)
 *  - title: string (requerido)
 *  - description: string (requerido)
 *  - requirements: string (requerido)
 *  - companyName: string (requerido)
 *  - phone: string | null (opcional)
 *  - email: string | null (opcional)
 *  - createDate: string date-time (autogenerada)
 *
 * Las ofertas se crean vía application/json y, como el resto de recursos,
 * requieren autenticación (sección 1).
 *
 * NOTA (TDD): describe comportamiento aún NO implementado; fallará hasta que
 * exista el módulo `jobs` montado (protegido) en /jobs.
 */

// Token del admin semilla para las peticiones autenticadas.
let bearer: string;
beforeAll(async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@ayto.local', password: 'admin1234' });
  bearer = `Bearer ${res.body.token}`;
});

const api = {
  get: (url: string) => request(app).get(url).set('Authorization', bearer),
  post: (url: string) => request(app).post(url).set('Authorization', bearer),
  put: (url: string) => request(app).put(url).set('Authorization', bearer),
};

// Helper: crea una oferta válida (todos los campos) y devuelve la respuesta.
// Pasar `undefined` en un campo lo omite del body (JSON.stringify lo descarta).
function crearOferta(overrides: Record<string, unknown> = {}) {
  return api.post('/jobs').send({
    title: 'Peón de obra',
    description: 'Se busca peón para obras municipales.',
    requirements: 'Experiencia mínima de 1 año. Carné de conducir B.',
    companyName: 'Construcciones del Pueblo S.L.',
    phone: '612345678',
    email: 'empleo@construccionesdelpueblo.com',
    ...overrides,
  });
}

describe('Ofertas de trabajo - POST /jobs', () => {
  it('crea una oferta y devuelve 201 con el recurso creado', async () => {
    const res = await crearOferta();

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Peón de obra',
      description: 'Se busca peón para obras municipales.',
      requirements: 'Experiencia mínima de 1 año. Carné de conducir B.',
      companyName: 'Construcciones del Pueblo S.L.',
    });
    expect(typeof res.body.id).toBe('number');
    expect(res.body.createDate).toBeDefined();
  });

  it('responde en formato JSON', async () => {
    const res = await crearOferta();

    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('devuelve los campos de contacto cuando se envían', async () => {
    const res = await crearOferta();

    expect(res.body.phone).toBe('612345678');
    expect(res.body.email).toBe('empleo@construccionesdelpueblo.com');
  });

  it('permite crear una oferta sin phone (opcional)', async () => {
    const res = await crearOferta({ phone: undefined });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('phone'); // string | null
  });

  it('permite crear una oferta sin email (opcional)', async () => {
    const res = await crearOferta({ email: undefined });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email'); // string | null
  });

  it('permite crear una oferta sin phone ni email', async () => {
    const res = await crearOferta({ phone: undefined, email: undefined });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('phone');
    expect(res.body).toHaveProperty('email');
  });

  it('devuelve 400 si falta el title', async () => {
    const res = await crearOferta({ title: undefined });

    expect(res.status).toBe(400);
  });

  it('devuelve 400 si falta la description', async () => {
    const res = await crearOferta({ description: undefined });

    expect(res.status).toBe(400);
  });

  it('devuelve 400 si faltan los requirements', async () => {
    const res = await crearOferta({ requirements: undefined });

    expect(res.status).toBe(400);
  });

  it('devuelve 400 si falta el companyName', async () => {
    const res = await crearOferta({ companyName: undefined });

    expect(res.status).toBe(400);
  });

  it('devuelve 401 si no se envía token', async () => {
    const res = await request(app).post('/jobs').send({
      title: 'Peón de obra',
      description: 'Se busca peón para obras municipales.',
      requirements: 'Experiencia mínima de 1 año.',
      companyName: 'Construcciones del Pueblo S.L.',
    });

    expect(res.status).toBe(401);
  });
});

/**
 * GET /jobs — listar todas las ofertas (docs/0001-diseno-api.md, sección 5).
 * NOTA (TDD): describe comportamiento aún NO implementado (el router solo tiene
 * POST); fallará hasta que exista el listado en /jobs.
 */
describe('Ofertas de trabajo - GET /jobs', () => {
  it('devuelve 200 y un array de ofertas', async () => {
    await crearOferta();

    const res = await api.get('/jobs');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('responde en formato JSON', async () => {
    const res = await api.get('/jobs');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('cada oferta del listado incluye los campos del modelo', async () => {
    const creada = await crearOferta();

    const res = await api.get('/jobs');
    const oferta = res.body.find((j: { id: number }) => j.id === creada.body.id);

    expect(oferta).toBeDefined();
    expect(typeof oferta.id).toBe('number');
    expect(typeof oferta.title).toBe('string');
    expect(typeof oferta.description).toBe('string');
    expect(typeof oferta.requirements).toBe('string');
    expect(typeof oferta.companyName).toBe('string');
    expect(oferta).toHaveProperty('phone'); // string | null
    expect(oferta).toHaveProperty('email'); // string | null
    expect(oferta.createDate).toBeDefined();
  });

  it('incluye una oferta recién creada con sus datos', async () => {
    const creada = await crearOferta({
      title: 'Electricista municipal',
      companyName: 'Ayuntamiento',
    });

    const res = await api.get('/jobs');
    const oferta = res.body.find((j: { id: number }) => j.id === creada.body.id);

    expect(oferta).toMatchObject({
      id: creada.body.id,
      title: 'Electricista municipal',
      companyName: 'Ayuntamiento',
    });
  });

  it('devuelve todas las ofertas creadas', async () => {
    const primera = await crearOferta({ title: 'Primera oferta' });
    const segunda = await crearOferta({ title: 'Segunda oferta' });

    const res = await api.get('/jobs');
    const ids = res.body.map((j: { id: number }) => j.id);

    expect(ids).toContain(primera.body.id);
    expect(ids).toContain(segunda.body.id);
  });

  it('devuelve 401 si no se envía token', async () => {
    const res = await request(app).get('/jobs');

    expect(res.status).toBe(401);
  });
});

/**
 * GET /jobs/:id — obtener una oferta por ID (docs/0001-diseno-api.md, sección 5).
 * NOTA (TDD): describe comportamiento aún NO implementado (el router solo tiene
 * GET / y POST /); fallará hasta que exista la obtención por ID en /jobs/:id.
 */
describe('Ofertas de trabajo - GET /jobs/:id', () => {
  it('devuelve 200 y la oferta solicitada', async () => {
    const creada = await crearOferta({ title: 'Oferta concreta', companyName: 'Empresa X' });

    const res = await api.get(`/jobs/${creada.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(creada.body.id);
    expect(res.body.title).toBe('Oferta concreta');
    expect(res.body.companyName).toBe('Empresa X');
  });

  it('responde en formato JSON', async () => {
    const creada = await crearOferta();

    const res = await api.get(`/jobs/${creada.body.id}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('la oferta devuelta incluye todos los campos del modelo', async () => {
    const creada = await crearOferta();

    const res = await api.get(`/jobs/${creada.body.id}`);

    expect(typeof res.body.id).toBe('number');
    expect(typeof res.body.title).toBe('string');
    expect(typeof res.body.description).toBe('string');
    expect(typeof res.body.requirements).toBe('string');
    expect(typeof res.body.companyName).toBe('string');
    expect(res.body).toHaveProperty('phone'); // string | null
    expect(res.body).toHaveProperty('email'); // string | null
    expect(res.body.createDate).toBeDefined();
  });

  it('devuelve la oferta correcta cuando hay varias', async () => {
    await crearOferta({ title: 'Primera' });
    const segunda = await crearOferta({ title: 'Segunda' });

    const res = await api.get(`/jobs/${segunda.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(segunda.body.id);
    expect(res.body.title).toBe('Segunda');
  });

  it('devuelve 404 si la oferta no existe', async () => {
    const res = await api.get('/jobs/999999');

    expect(res.status).toBe(404);
  });

  it('devuelve 401 si no se envía token', async () => {
    const res = await request(app).get('/jobs/1');

    expect(res.status).toBe(401);
  });
});

/**
 * PUT /jobs/:id — actualizar una oferta (docs/0001-diseno-api.md, sección 5).
 * Requiere los mismos campos obligatorios que la creación.
 * NOTA (TDD): describe comportamiento aún NO implementado; fallará hasta que
 * exista la actualización en /jobs/:id.
 */
describe('Ofertas de trabajo - PUT /jobs/:id', () => {
  const datosValidos = {
    title: 'Título actualizado',
    description: 'Descripción actualizada',
    requirements: 'Requisitos actualizados',
    companyName: 'Nueva Empresa S.L.',
  };

  it('actualiza una oferta existente y devuelve 200', async () => {
    const creada = await crearOferta({ title: 'Título original' });

    const res = await api.put(`/jobs/${creada.body.id}`).send(datosValidos);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(creada.body.id);
    expect(res.body.title).toBe('Título actualizado');
    expect(res.body.description).toBe('Descripción actualizada');
    expect(res.body.requirements).toBe('Requisitos actualizados');
    expect(res.body.companyName).toBe('Nueva Empresa S.L.');
  });

  it('persiste el cambio (un GET posterior devuelve los datos actualizados)', async () => {
    const creada = await crearOferta({ title: 'Antes' });

    await api.put(`/jobs/${creada.body.id}`).send({ ...datosValidos, title: 'Después' });

    const res = await api.get(`/jobs/${creada.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Después');
  });

  it('responde en formato JSON', async () => {
    const creada = await crearOferta();

    const res = await api.put(`/jobs/${creada.body.id}`).send(datosValidos);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('actualiza los campos de contacto (phone/email)', async () => {
    const creada = await crearOferta({ phone: '600000000', email: 'viejo@empresa.com' });

    const res = await api.put(`/jobs/${creada.body.id}`).send({
      ...datosValidos,
      phone: '611111111',
      email: 'nuevo@empresa.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe('611111111');
    expect(res.body.email).toBe('nuevo@empresa.com');
  });

  it('devuelve 400 si faltan campos requeridos', async () => {
    const creada = await crearOferta();

    const res = await api.put(`/jobs/${creada.body.id}`).send({ ...datosValidos, title: undefined });

    expect(res.status).toBe(400);
  });

  it('devuelve 404 si la oferta no existe', async () => {
    const res = await api.put('/jobs/999999').send(datosValidos);

    expect(res.status).toBe(404);
  });

  it('devuelve 401 si no se envía token', async () => {
    const res = await request(app).put('/jobs/1').send(datosValidos);

    expect(res.status).toBe(401);
  });
});
