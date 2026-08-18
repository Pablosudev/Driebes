import type { BookingInterface } from './booking.interface';
import type { BookingRepository } from '../infrastructure/persistence/booking.repository';

export class ListBookingsUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(): Promise<BookingInterface[]> {
    return this.repository.findAll();
  }
}