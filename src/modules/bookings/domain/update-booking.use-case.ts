import type { BookingInterface, BookingState } from './booking.interface';
import type { BookingRepository } from '../infrastructure/persistence/booking.repository';
import { ValidationError, NotFoundError, ConflictError } from './errors';
import { findConflicts } from './availability';

// Estados que se pueden persistir. 'free' es calculado, no se guarda.
const PERSISTABLE_STATES: BookingState[] = ['pending', 'reserved'];

export interface UpdateBookingInput {
  name?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  state?: string;
  notes?: string | null;
}

export class UpdateBookingUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(id: number, input: UpdateBookingInput): Promise<BookingInterface> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la reserva con id ${id}`);
    }

    const name = input.name?.trim();
    const phone = input.phone?.trim();
    const startDate = input.startDate?.trim();
    const endDate = input.endDate?.trim();

    if (!name || !phone || !startDate || !endDate) {
      throw new ValidationError('Comprueba los campos obligatorios');
    }

    const state = input.state ?? existing.state;
    if (!PERSISTABLE_STATES.includes(state as BookingState)) {
      throw new ValidationError('El estado solo puede ser "pending" o "reserved"');
    }

    // El propio registro no cuenta como conflicto consigo mismo.
    const others = (await this.repository.findAll()).filter((booking) => booking.id !== id);
    if (findConflicts(others, startDate, endDate).length > 0) {
      throw new ConflictError('El rango de fechas solicitado está ocupado');
    }

    return this.repository.update(id, {
      name,
      phone,
      startDate,
      endDate,
      state: state as BookingState,
      notes: input.notes ?? null,
      createDate: existing.createDate,
    });
  }
}
