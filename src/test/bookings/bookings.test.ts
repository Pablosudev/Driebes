import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';

const app = createApp();

/**
 * Tests de integración para la gestión de Reservas del local municipal.
 * Contrato basado en docs/0001-diseno-api.md.
 *
 * Modelo Booking:
 *  - id: number (autoincremental)
 *  - name: string (requerido)
 *  - phone: string (requerido)
 *  - startDate: string date-time (requerido)
 *  - endDate: string date-time (requerido)
 *  - state: 'free' | 'pending' | 'reserved'
 *  - notes: string | null (opcional)
 *  - createDate: string date-time (autogenerada)
 *
 * Las reservas se crean vía application/json y nacen con estado 'pending'.
 */

// Cada reserva ocupa un día completo (regla de negocio: un día = una reserva).
// Para que las reservas creadas en distintos tests no choquen entre sí, cada
// llamada al helper genera un día único a partir de 2030-01-01. Ese rango queda
// aislado de las fechas dedicadas que usan los tests de conflicto/disponibilidad
// (2026-09-xx, 2027-01-xx).
let bookingDaySeq = 0;
function nextUniqueDates() {
  const day = new Date(Date.UTC(2030, 0, 1) + bookingDaySeq * 86_400_000)
    .toISOString()
    .slice(0, 10);
  bookingDaySeq += 1;
  return { startDate: `${day}T09:00:00Z`, endDate: `${day}T13:00:00Z` };
}

// Helper: crea una reserva válida (en un día único) y devuelve la respuesta.
async function crearReserva(
  name = 'Juan García',
  phone = '612345678',
  notes = 'Necesito mesas y sillas para 30 personas.',
) {
  const { startDate, endDate } = nextUniqueDates();
  return request(app)
    .post('/bookings')
    .send({ name, phone, startDate, endDate, notes });
}

describe('Bookings', () => {
  describe('POST /bookings', () => {
    it('crea una reserva y devuelve 201 con el recurso creado', async () => {
      const res = await crearReserva('Juan García', '612345678');

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Juan García',
        phone: '612345678',
      });
      expect(typeof res.body.id).toBe('number');
      expect(res.body.createDate).toBeDefined();
    });

    it('crea la reserva con estado inicial "pending"', async () => {
      const res = await crearReserva();

      expect(res.status).toBe(201);
      expect(res.body.state).toBe('pending');
    });

    it('permite crear una reserva sin notas (campo opcional)', async () => {
      const res = await request(app).post('/bookings').send({
        name: 'Sin notas',
        phone: '600000000',
        startDate: '2026-07-10T09:00:00Z',
        endDate: '2026-07-10T13:00:00Z',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('notes'); // string | null
    });

    it('devuelve 400 si falta el name', async () => {
      const res = await request(app).post('/bookings').send({
        phone: '612345678',
        startDate: '2026-07-10T09:00:00Z',
        endDate: '2026-07-10T13:00:00Z',
      });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta el phone', async () => {
      const res = await request(app).post('/bookings').send({
        name: 'Sin teléfono',
        startDate: '2026-07-10T09:00:00Z',
        endDate: '2026-07-10T13:00:00Z',
      });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta startDate', async () => {
      const res = await request(app).post('/bookings').send({
        name: 'Sin fecha inicio',
        phone: '612345678',
        endDate: '2026-07-10T13:00:00Z',
      });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si falta endDate', async () => {
      const res = await request(app).post('/bookings').send({
        name: 'Sin fecha fin',
        phone: '612345678',
        startDate: '2026-07-10T09:00:00Z',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /bookings', () => {
    it('devuelve 200 y un array de reservas', async () => {
      await crearReserva();

      const res = await request(app).get('/bookings');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('responde en formato JSON', async () => {
      const res = await request(app).get('/bookings');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('cada reserva del listado incluye los campos del modelo', async () => {
      const creada = await crearReserva();

      const res = await request(app).get('/bookings');
      const reserva = res.body.find((r: { id: number }) => r.id === creada.body.id);

      expect(reserva).toBeDefined();
      expect(typeof reserva.id).toBe('number');
      expect(typeof reserva.name).toBe('string');
      expect(typeof reserva.phone).toBe('string');
      expect(reserva.startDate).toBeDefined();
      expect(reserva.endDate).toBeDefined();
      expect(typeof reserva.state).toBe('string');
      expect(reserva).toHaveProperty('notes'); // string | null
      expect(reserva.createDate).toBeDefined();
    });

    it('incluye una reserva recién creada con sus datos', async () => {
      const creada = await crearReserva('María López', '600111222');

      const res = await request(app).get('/bookings');
      const reserva = res.body.find((r: { id: number }) => r.id === creada.body.id);

      expect(reserva).toMatchObject({
        id: creada.body.id,
        name: 'María López',
        phone: '600111222',
      });
    });

    it('crea la reserva con estado inicial "pending"', async () => {
      const creada = await crearReserva('Ana Ruiz', '699888777');

      const res = await request(app).get('/bookings');
      const reserva = res.body.find((r: { id: number }) => r.id === creada.body.id);

      expect(reserva.state).toBe('pending');
    });

  });

  describe('GET /bookings?state=', () => {
    it('devuelve 200 y un array al filtrar por estado', async () => {
      await crearReserva();

      const res = await request(app).get('/bookings?state=pending');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('solo devuelve reservas con el estado solicitado', async () => {
      await crearReserva();

      const res = await request(app).get('/bookings?state=pending');

      expect(res.body.every((r: { state: string }) => r.state === 'pending')).toBe(true);
    });

    it('incluye una reserva pendiente recién creada al filtrar por ?state=pending', async () => {
      const creada = await crearReserva('Filtrable', '600123123');

      const res = await request(app).get('/bookings?state=pending');
      const ids = res.body.map((r: { id: number }) => r.id);

      expect(ids).toContain(creada.body.id);
    });

    it('no incluye la reserva al filtrar por un estado distinto (?state=reserved)', async () => {
      const creada = await crearReserva();

      const res = await request(app).get('/bookings?state=reserved');
      const ids = res.body.map((r: { id: number }) => r.id);

      expect(res.status).toBe(200);
      expect(ids).not.toContain(creada.body.id);
    });

    it('sin el parámetro state devuelve todas las reservas', async () => {
      const creada = await crearReserva();

      const res = await request(app).get('/bookings');
      const ids = res.body.map((r: { id: number }) => r.id);

      expect(ids).toContain(creada.body.id);
    });
  });

  describe('GET /bookings/:id', () => {
    it('devuelve 200 y la reserva solicitada', async () => {
      const creada = await crearReserva('Reserva concreta', '611223344');

      const res = await request(app).get(`/bookings/${creada.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creada.body.id);
      expect(res.body.name).toBe('Reserva concreta');
      expect(res.body.phone).toBe('611223344');
    });

    it('responde en formato JSON', async () => {
      const creada = await crearReserva();

      const res = await request(app).get(`/bookings/${creada.body.id}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('la reserva devuelta incluye todos los campos del modelo', async () => {
      const creada = await crearReserva();

      const res = await request(app).get(`/bookings/${creada.body.id}`);

      expect(typeof res.body.id).toBe('number');
      expect(typeof res.body.name).toBe('string');
      expect(typeof res.body.phone).toBe('string');
      expect(res.body.startDate).toBeDefined();
      expect(res.body.endDate).toBeDefined();
      expect(typeof res.body.state).toBe('string');
      expect(res.body).toHaveProperty('notes'); // string | null
      expect(res.body.createDate).toBeDefined();
    });

    it('devuelve la reserva correcta cuando hay varias', async () => {
      await crearReserva('Primera', '600000001');
      const segunda = await crearReserva('Segunda', '600000002');

      const res = await request(app).get(`/bookings/${segunda.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(segunda.body.id);
      expect(res.body.name).toBe('Segunda');
    });

    it('devuelve 404 si la reserva no existe', async () => {
      const res = await request(app).get('/bookings/999999');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /bookings/:id/state', () => {
    it('confirma una reserva cambiando su estado a "reserved" y devuelve 200', async () => {
      const creada = await crearReserva();

      const res = await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({ state: 'reserved' });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(creada.body.id);
      expect(res.body.state).toBe('reserved');
    });

    it('persiste el cambio (un GET posterior devuelve el nuevo estado)', async () => {
      const creada = await crearReserva();

      await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({ state: 'reserved' });

      const res = await request(app).get(`/bookings/${creada.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.state).toBe('reserved');
    });

    it('responde en formato JSON', async () => {
      const creada = await crearReserva();

      const res = await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({ state: 'reserved' });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('la reserva confirmada aparece al filtrar por ?state=reserved', async () => {
      const creada = await crearReserva();

      await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({ state: 'reserved' });

      const res = await request(app).get('/bookings?state=reserved');
      const ids = res.body.map((r: { id: number }) => r.id);

      expect(res.status).toBe(200);
      expect(ids).toContain(creada.body.id);
      expect(res.body.every((r: { state: string }) => r.state === 'reserved')).toBe(true);
    });

    it('la reserva confirmada desaparece del filtro ?state=pending', async () => {
      const creada = await crearReserva();

      await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({ state: 'reserved' });

      const res = await request(app).get('/bookings?state=pending');
      const ids = res.body.map((r: { id: number }) => r.id);

      expect(ids).not.toContain(creada.body.id);
    });

    it('devuelve 400 si falta el campo state', async () => {
      const creada = await crearReserva();

      const res = await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si el estado no es válido', async () => {
      const creada = await crearReserva();

      const res = await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({ state: 'invalido' });

      expect(res.status).toBe(400);
    });

    it('devuelve 400 si se intenta asignar el estado "free" (no es asignable a mano)', async () => {
      const creada = await crearReserva();

      const res = await request(app)
        .patch(`/bookings/${creada.body.id}/state`)
        .send({ state: 'free' });

      expect(res.status).toBe(400);
    });

    it('devuelve 404 si la reserva no existe', async () => {
      const res = await request(app)
        .patch('/bookings/999999/state')
        .send({ state: 'reserved' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /bookings/:id', () => {
    it('elimina una reserva existente y devuelve 204', async () => {
      const creada = await crearReserva();

      const res = await request(app).delete(`/bookings/${creada.body.id}`);

      expect(res.status).toBe(204);

      // Tras eliminarla, ya no debe encontrarse.
      const verificacion = await request(app).get(`/bookings/${creada.body.id}`);
      expect(verificacion.status).toBe(404);
    });

    it('la reserva eliminada desaparece del listado', async () => {
      const creada = await crearReserva('Para borrar', '600555444');

      await request(app).delete(`/bookings/${creada.body.id}`);

      const res = await request(app).get('/bookings');
      const ids = res.body.map((r: { id: number }) => r.id);
      expect(ids).not.toContain(creada.body.id);
    });

    it('no afecta a otras reservas', async () => {
      const aBorrar = await crearReserva('A borrar', '600111111');
      const superviviente = await crearReserva('Superviviente', '600222222');

      await request(app).delete(`/bookings/${aBorrar.body.id}`);

      const res = await request(app).get(`/bookings/${superviviente.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(superviviente.body.id);
    });

    it('devuelve 404 si la reserva no existe', async () => {
      const res = await request(app).delete('/bookings/999999');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /bookings - conflicto de fechas', () => {
    it('devuelve 409 si el día solicitado ya está ocupado por otra reserva', async () => {
      await request(app).post('/bookings').send({
        name: 'Primera',
        phone: '600000001',
        startDate: '2026-09-01T09:00:00Z',
        endDate: '2026-09-01T13:00:00Z',
      });

      const res = await request(app).post('/bookings').send({
        name: 'Segunda',
        phone: '600000002',
        startDate: '2026-09-01T15:00:00Z',
        endDate: '2026-09-01T18:00:00Z',
      });

      expect(res.status).toBe(409);
    });

    it('permite crear reservas en días distintos', async () => {
      const primera = await request(app).post('/bookings').send({
        name: 'Día A',
        phone: '600000003',
        startDate: '2026-09-10T09:00:00Z',
        endDate: '2026-09-10T13:00:00Z',
      });

      const segunda = await request(app).post('/bookings').send({
        name: 'Día B',
        phone: '600000004',
        startDate: '2026-09-11T09:00:00Z',
        endDate: '2026-09-11T13:00:00Z',
      });

      expect(primera.status).toBe(201);
      expect(segunda.status).toBe(201);
    });

    it('una reserva confirmada (reserved) también bloquea el día', async () => {
      const confirmada = await request(app).post('/bookings').send({
        name: 'Confirmada',
        phone: '600000005',
        startDate: '2026-09-15T09:00:00Z',
        endDate: '2026-09-15T13:00:00Z',
      });
      await request(app)
        .patch(`/bookings/${confirmada.body.id}/state`)
        .send({ state: 'reserved' });

      const res = await request(app).post('/bookings').send({
        name: 'Choca con confirmada',
        phone: '600000006',
        startDate: '2026-09-15T15:00:00Z',
        endDate: '2026-09-15T18:00:00Z',
      });

      expect(res.status).toBe(409);
    });

    it('el día vuelve a estar libre tras eliminar la reserva que lo ocupaba', async () => {
      const temporal = await request(app).post('/bookings').send({
        name: 'Temporal',
        phone: '600000007',
        startDate: '2026-09-20T09:00:00Z',
        endDate: '2026-09-20T13:00:00Z',
      });
      await request(app).delete(`/bookings/${temporal.body.id}`);

      const res = await request(app).post('/bookings').send({
        name: 'Nueva',
        phone: '600000008',
        startDate: '2026-09-20T09:00:00Z',
        endDate: '2026-09-20T13:00:00Z',
      });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /bookings?date= (disponibilidad)', () => {
    it('devuelve available: true para un día sin reservas', async () => {
      const res = await request(app).get('/bookings?date=2027-01-01');

      expect(res.status).toBe(200);
      expect(res.body.date).toBe('2027-01-01');
      expect(res.body.available).toBe(true);
    });

    it('devuelve available: false para un día ocupado', async () => {
      await request(app).post('/bookings').send({
        name: 'Ocupa el día',
        phone: '600000010',
        startDate: '2027-01-05T09:00:00Z',
        endDate: '2027-01-05T13:00:00Z',
      });

      const res = await request(app).get('/bookings?date=2027-01-05');

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(false);
    });

    it('vuelve a estar disponible tras eliminar la reserva de ese día', async () => {
      const creada = await request(app).post('/bookings').send({
        name: 'Ocupa temporal',
        phone: '600000011',
        startDate: '2027-01-10T09:00:00Z',
        endDate: '2027-01-10T13:00:00Z',
      });
      await request(app).delete(`/bookings/${creada.body.id}`);

      const res = await request(app).get('/bookings?date=2027-01-10');

      expect(res.status).toBe(200);
      expect(res.body.available).toBe(true);
    });
  });
});
