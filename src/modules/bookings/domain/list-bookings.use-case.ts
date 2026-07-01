import type { BookingInterface, BookingState } from './booking.interface';
import type { BookingRepository } from '../infrastructure/persistence/booking.repository';

export class ListBookingsUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(state?: BookingState): Promise<BookingInterface[]> {
    return this.repository.findAll(state);
  }
}
