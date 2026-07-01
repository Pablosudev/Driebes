import type { PrismaClient, Event } from '../../../../generated/prisma/client';
import type { EventInterface, Category } from '../../domain/event.interface';
import type { EventRepository } from './event.repository';

// Traduce una fila de Prisma (fechas como Date, enum) a la entidad de dominio
// (fechas como cadenas ISO 8601), que es el contrato de EventInterface.
function toEvent(row: Event): EventInterface {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    creationDate: row.creationDate.toISOString(),
    eventDate: row.eventDate.toISOString(),
    category: row.category as Category,
  };
}

export class PostgresEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(data: Omit<EventInterface, 'id'>): Promise<EventInterface> {
    const created = await this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        creationDate: new Date(data.creationDate),
        eventDate: new Date(data.eventDate),
        category: data.category,
      },
    });
    return toEvent(created);
  }

  async findAll(category?: Category): Promise<EventInterface[]> {
    const rows = await this.prisma.event.findMany({
      where: category ? { category } : undefined,
      orderBy: { id: 'asc' },
    });
    return rows.map(toEvent);
  }

  async findById(id: number): Promise<EventInterface | null> {
    const row = await this.prisma.event.findUnique({ where: { id } });
    return row ? toEvent(row) : null;
  }

  async update(id: number, data: Omit<EventInterface, 'id'>): Promise<EventInterface> {
    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        creationDate: new Date(data.creationDate),
        eventDate: new Date(data.eventDate),
        category: data.category,
      },
    });
    return toEvent(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }
}
