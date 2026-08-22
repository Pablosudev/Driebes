import type { JobInterface } from './job.interface';
import type { JobRepository } from '../infrastructure/persistence/job.repository';
import { NotFoundError } from './errors';

export class GetJobByIdUseCase {
  constructor(private readonly repository: JobRepository) {}

  async execute(id: number): Promise<JobInterface> {
    const job = await this.repository.findById(id);
    if (!job) {
      throw new NotFoundError('Oferta no encontrada');
    }
    return job;
  }
}
