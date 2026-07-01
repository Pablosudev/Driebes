import type { BookingInterface, BookingState } from '../../domain/booking.interface';

export interface BookingRepository {
  save(data: Omit<BookingInterface, 'id'>): Promise<BookingInterface>;
  findAll(state?: BookingState): Promise<BookingInterface[]>;
  findById(id: number): Promise<BookingInterface | null>;
  update(id: number, data: Omit<BookingInterface, 'id'>): Promise<BookingInterface>;
  delete(id: number): Promise<void>;
}

export class InMemoryBookingRepository implements BookingRepository {
  private bookings: Map<number, BookingInterface> = new Map();
  private nextId: number = 1;

  async save(data: Omit<BookingInterface, 'id'>): Promise<BookingInterface> {
    const booking: BookingInterface = { id: this.nextId++, ...data };
    this.bookings.set(booking.id, booking);
    return booking;
  }

  async findAll(state?: BookingState): Promise<BookingInterface[]> {
    const all = Array.from(this.bookings.values());
    return state ? all.filter((booking) => booking.state === state) : all;
  }

  async findById(id: number): Promise<BookingInterface | null> {
    return this.bookings.get(id) ?? null;
  }

  async update(id: number, data: Omit<BookingInterface, 'id'>): Promise<BookingInterface> {
    const updated: BookingInterface = { id, ...data };
    this.bookings.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.bookings.delete(id);
  }
}
