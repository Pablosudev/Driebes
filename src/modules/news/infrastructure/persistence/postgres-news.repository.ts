import type { PrismaClient, News } from '../../../../generated/prisma/client';
import type { NewInterface } from '../../domain/news.interface';
import type { NewsRepository } from './news.repository';

// Traduce una fila de Prisma (uploadDate como Date) a la entidad de dominio
// (uploadDate como cadena ISO 8601), que es el contrato de NewInterface.
function toNews(row: News): NewInterface {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    uploadDate: row.uploadDate.toISOString(),
  };
}

export class PostgresNewsRepository implements NewsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(data: Omit<NewInterface, 'id'>): Promise<NewInterface> {
    const created = await this.prisma.news.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        uploadDate: new Date(data.uploadDate),
      },
    });
    return toNews(created);
  }

  async findAll(): Promise<NewInterface[]> {
    const rows = await this.prisma.news.findMany({ orderBy: { id: 'asc' } });
    return rows.map(toNews);
  }

  async findById(id: number): Promise<NewInterface | null> {
    const row = await this.prisma.news.findUnique({ where: { id } });
    return row ? toNews(row) : null;
  }

  async update(id: number, data: Omit<NewInterface, 'id'>): Promise<NewInterface> {
    const updated = await this.prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        uploadDate: new Date(data.uploadDate),
      },
    });
    return toNews(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.news.delete({ where: { id } });
  }
}
