import type { BookingInterface, BookingInputInterface } from './booking.interface';
import type { BookingRepository } from '../infrastructure/persistence/booking.repository';
import { ValidationError, ConflictError } from './errors';
import { findConflicts } from './availability';

export class CreateBookingUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(input: Partial<BookingInputInterface>): Promise<BookingInterface> {
    const name = input.name?.trim();
    const phone = input.phone?.trim();
    const startDate = input.startDate?.trim();
    const endDate = input.endDate?.trim();

    if (!name || !phone || !startDate || !endDate) {
      throw new ValidationError('Comprueba los campos obligatorios');
    }

    const existing = await this.repository.findAll();
    if (findConflicts(existing, startDate, endDate).length > 0) {
      throw new ConflictError('El rango de fechas solicitado está ocupado');
    }

    return this.repository.save({
      name,
      phone,
      startDate,
      endDate,
      state: 'pending',
      notes: input.notes ?? null,
      createDate: new Date().toISOString(),
    });
  }
}
