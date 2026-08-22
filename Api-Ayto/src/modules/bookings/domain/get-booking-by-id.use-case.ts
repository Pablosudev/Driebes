import type { BookingInterface } from './booking.interface';
import type { BookingRepository } from '../infrastructure/persistence/booking.repository';
import { NotFoundError } from './errors';

export class GetBookingByIdUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(id: number): Promise<BookingInterface> {
    const booking = await this.repository.findById(id);

    if (!booking) {
      throw new NotFoundError(`No existe la reserva con id ${id}`);
    }

    return booking;
  }
}
