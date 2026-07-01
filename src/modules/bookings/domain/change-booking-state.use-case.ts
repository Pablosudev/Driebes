import type { BookingInterface, BookingState } from './booking.interface';
import type { BookingRepository } from '../infrastructure/persistence/booking.repository';
import { ValidationError, NotFoundError } from './errors';

// Estados que se pueden asignar manualmente mediante PATCH.
// La única transición contemplada es pending -> reserved (confirmar la reserva).
// 'free' es un estado calculado (no se persiste), por eso no es asignable.
const ASSIGNABLE_STATES: BookingState[] = ['reserved'];

export class ChangeBookingStateUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(id: number, state?: string): Promise<BookingInterface> {
    if (!state || !ASSIGNABLE_STATES.includes(state as BookingState)) {
      throw new ValidationError('El estado solo puede cambiarse a "reserved"');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la reserva con id ${id}`);
    }

    return this.repository.update(id, {
      name: existing.name,
      phone: existing.phone,
      startDate: existing.startDate,
      endDate: existing.endDate,
      state: state as BookingState,
      notes: existing.notes,
      createDate: existing.createDate,
    });
  }
}
