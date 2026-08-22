import type { JobInterface, JobInputInterface } from './job.interface';
import type { JobRepository } from '../infrastructure/persistence/job.repository';
import { NotFoundError, ValidationError } from './errors';

export class UpdateJobUseCase {
  constructor(private readonly repository: JobRepository) {}

  async execute(id: number, input: Partial<JobInputInterface>): Promise<JobInterface> {
    const title = input.title?.trim();
    const description = input.description?.trim();
    const requirements = input.requirements?.trim();
    const companyName = input.companyName?.trim();

    if (!title || !description || !requirements || !companyName) {
      throw new ValidationError('Comprueba los campos obligatorios');
    }

    const job = await this.repository.update(id, {
      title,
      description,
      requirements,
      companyName,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
    });

    if (!job) {
      throw new NotFoundError('Oferta no encontrada');
    }

    return job;
  }
}
