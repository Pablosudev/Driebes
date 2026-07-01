import { Router } from 'express';
import { CreateBookingUseCase } from '../../domain/create-booking.use-case';
import { ListBookingsUseCase } from '../../domain/list-bookings.use-case';
import { GetBookingByIdUseCase } from '../../domain/get-booking-by-id.use-case';
import { ChangeBookingStateUseCase } from '../../domain/change-booking-state.use-case';
import { DeleteBookingUseCase } from '../../domain/delete-booking.use-case';
import { CheckAvailabilityUseCase } from '../../domain/check-availability.use-case';
import { ValidationError, NotFoundError, ConflictError } from '../../domain/errors';
import type { BookingState } from '../../domain/booking.interface';

interface BookingsRouterDeps {
  createBooking: CreateBookingUseCase;
  listBookings: ListBookingsUseCase;
  getBookingById: GetBookingByIdUseCase;
  changeBookingState: ChangeBookingStateUseCase;
  deleteBooking: DeleteBookingUseCase;
  checkAvailability: CheckAvailabilityUseCase;
}

export function BookingsRouter({
  createBooking,
  listBookings,
  getBookingById,
  changeBookingState,
  deleteBooking,
  checkAvailability,
}: BookingsRouterDeps): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      // ?date= consulta la disponibilidad de un día concreto.
      if (typeof req.query.date === 'string') {
        const date = req.query.date;
        const available = await checkAvailability.execute(date);
        res.status(200).json({ date, available });
        return;
      }

      const state =
        typeof req.query.state === 'string' ? (req.query.state as BookingState) : undefined;
      const bookings = await listBookings.execute(state);
      res.status(200).json(bookings);
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      const booking = await getBookingById.execute(id);
      res.status(200).json(booking);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const booking = await createBooking.execute({
        name: req.body.name,
        phone: req.body.phone,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        notes: req.body.notes,
      });

      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof ConflictError) {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.patch('/:id/state', async (req, res) => {
    const id = Number(req.params.id);
    try {
      const booking = await changeBookingState.execute(id, req.body.state);
      res.status(200).json(booking);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      await deleteBooking.execute(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
}
