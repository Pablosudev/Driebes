import { Router } from 'express';
import { CreateBookingUseCase } from '../../domain/create-booking.use-case';
import { ListBookingsUseCase } from '../../domain/list-bookings.use-case';
import { GetBookingByIdUseCase } from '../../domain/get-booking-by-id.use-case';
import { UpdateBookingUseCase } from '../../domain/update-booking.use-case';
import { DeleteBookingUseCase } from '../../domain/delete-booking.use-case';
import { ValidationError, NotFoundError, ConflictError } from '../../domain/errors';

interface BookingsRouterDeps {
  createBooking: CreateBookingUseCase;
  listBookings: ListBookingsUseCase;
  getBookingById: GetBookingByIdUseCase;
  updateBooking: UpdateBookingUseCase;
  deleteBooking: DeleteBookingUseCase;
}

export function BookingsRouter({
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
}: BookingsRouterDeps): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const bookings = await listBookings.execute();
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
  
    const body = req.body ?? {};
    try {
      const booking = await createBooking.execute({
        name: body.name,
        phone: body.phone,
        startDate: body.startDate,
        endDate: body.endDate,
        notes: body.notes,
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

  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const body = req.body ?? {};
    try {
      const booking = await updateBooking.execute(id, {
        name: body.name,
        phone: body.phone,
        startDate: body.startDate,
        endDate: body.endDate,
        state: body.state,
        notes: body.notes,
      });

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
      if (error instanceof ConflictError) {
        res.status(409).json({ error: error.message });
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
