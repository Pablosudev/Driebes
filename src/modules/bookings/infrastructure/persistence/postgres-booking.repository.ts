import type { PrismaClient, Booking } from '../../../../generated/prisma/client';
import type { BookingInterface, BookingState } from '../../domain/booking.interface';
import type { BookingRepository } from './booking.repository';

// Traduce una fila de Prisma (fechas como Date, enum de Prisma) a la entidad de
// dominio (fechas como cadenas ISO 8601), que es el contrato de BookingInterface.
function toBooking(row: Booking): BookingInterface {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate.toISOString(),
    state: row.state as BookingState,
    notes: row.notes,
    createDate: row.createDate.toISOString(),
  };
}

export class PostgresBookingRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(data: Omit<BookingInterface, 'id'>): Promise<BookingInterface> {
    const created = await this.prisma.booking.create({
      data: {
        name: data.name,
        phone: data.phone,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        state: data.state,
        notes: data.notes,
        createDate: new Date(data.createDate),
      },
    });
    return toBooking(created);
  }

  async findAll(state?: BookingState): Promise<BookingInterface[]> {
    const rows = await this.prisma.booking.findMany({
      where: state ? { state } : undefined,
      orderBy: { id: 'asc' },
    });
    return rows.map(toBooking);
  }

  async findById(id: number): Promise<BookingInterface | null> {
    const row = await this.prisma.booking.findUnique({ where: { id } });
    return row ? toBooking(row) : null;
  }

  async update(id: number, data: Omit<BookingInterface, 'id'>): Promise<BookingInterface> {
    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        state: data.state,
        notes: data.notes,
        createDate: new Date(data.createDate),
      },
    });
    return toBooking(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.booking.delete({ where: { id } });
  }
}
