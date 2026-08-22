import type { PrismaClient, Job } from '../../../../generated/prisma/client';
import type { JobInterface } from '../../domain/job.interface';
import type { JobRepository } from './job.repository';

// Traduce una fila de Prisma (createDate como Date) a la entidad de dominio
// (createDate como cadena ISO 8601), que es el contrato de JobInterface.
function toJob(row: Job): JobInterface {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    companyName: row.companyName,
    phone: row.phone,
    email: row.email,
    createDate: row.createDate.toISOString(),
  };
}

export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(data: Omit<JobInterface, 'id'>): Promise<JobInterface> {
    const created = await this.prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        companyName: data.companyName,
        phone: data.phone,
        email: data.email,
        createDate: new Date(data.createDate),
      },
    });
    return toJob(created);
  }

  async findAll(): Promise<JobInterface[]> {
    const rows = await this.prisma.job.findMany({ orderBy: { id: 'asc' } });
    return rows.map(toJob);
  }

  async findById(id: number): Promise<JobInterface | null> {
    const row = await this.prisma.job.findUnique({ where: { id } });
    return row ? toJob(row) : null;
  }

  async update(id: number, data: Omit<JobInterface, 'id' | 'createDate'>): Promise<JobInterface | null> {
    const exists = await this.prisma.job.findUnique({ where: { id } });
    if (!exists) {
      return null;
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        companyName: data.companyName,
        phone: data.phone,
        email: data.email,
      },
    });
    return toJob(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.job.delete({ where: { id } });
  }
}
