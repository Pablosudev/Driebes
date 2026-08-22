import type { JobInterface, JobInputInterface } from './job.interface';
import type { JobRepository } from '../infrastructure/persistence/job.repository';
import { ValidationError } from './errors';

export class CreateJobUseCase {
  constructor(private readonly repository: JobRepository) {}

  async execute(input: Partial<JobInputInterface>): Promise<JobInterface> {
    const title = input.title?.trim();
    const description = input.description?.trim();
    const requirements = input.requirements?.trim();
    const companyName = input.companyName?.trim();

    if (!title || !description || !requirements || !companyName) {
      throw new ValidationError('Comprueba los campos obligatorios');
    }

    return this.repository.save({
      title,
      description,
      requirements,
      companyName,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      createDate: new Date().toISOString(),
    });
  }
}
