import type { BookingRepository } from '../infrastructure/persistence/booking.repository';
import { NotFoundError } from './errors';

export class DeleteBookingUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la reserva con id ${id}`);
    }

    await this.repository.delete(id);
  }
}
