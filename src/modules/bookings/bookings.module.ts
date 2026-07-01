import type { Router } from 'express';
import type { BookingRepository } from './infrastructure/persistence/booking.repository';
import { InMemoryBookingRepository } from './infrastructure/persistence/booking.repository';
import { PostgresBookingRepository } from './infrastructure/persistence/postgres-booking.repository';
import { getPrisma } from '../../db/prisma';
import { CreateBookingUseCase } from './domain/create-booking.use-case';
import { ListBookingsUseCase } from './domain/list-bookings.use-case';
import { GetBookingByIdUseCase } from './domain/get-booking-by-id.use-case';
import { ChangeBookingStateUseCase } from './domain/change-booking-state.use-case';
import { DeleteBookingUseCase } from './domain/delete-booking.use-case';
import { CheckAvailabilityUseCase } from './domain/check-availability.use-case';
import { BookingsRouter } from './infrastructure/transport/bookings.router';

// Selecciona la implementación de persistencia. Por defecto, en memoria (los
// tests no tocan ninguna base de datos). Con PERSISTENCE=postgres usa Prisma.
function createBookingRepository(): BookingRepository {
  if (process.env.PERSISTENCE === 'postgres') {
    return new PostgresBookingRepository(getPrisma());
  }
  return new InMemoryBookingRepository();
}

export function buildBookingsRouter(): Router {
  const repository = createBookingRepository();

  return BookingsRouter({
    createBooking: new CreateBookingUseCase(repository),
    listBookings: new ListBookingsUseCase(repository),
    getBookingById: new GetBookingByIdUseCase(repository),
    changeBookingState: new ChangeBookingStateUseCase(repository),
    deleteBooking: new DeleteBookingUseCase(repository),
    checkAvailability: new CheckAvailabilityUseCase(repository),
  });
}
