import type { BookingRepository } from '../infrastructure/persistence/booking.repository';
import { findConflicts } from './availability';

export class CheckAvailabilityUseCase {
  constructor(private readonly repository: BookingRepository) {}

  // Un día está disponible si ninguna reserva activa (pending/reserved) lo ocupa.
  async execute(date: string): Promise<boolean> {
    const bookings = await this.repository.findAll();
    return findConflicts(bookings, date, date).length === 0;
  }
}
