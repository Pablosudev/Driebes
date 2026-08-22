import type { JobInterface } from './job.interface';
import type { JobRepository } from '../infrastructure/persistence/job.repository';

export class ListJobsUseCase {
  constructor(private readonly repository: JobRepository) {}

  async execute(): Promise<JobInterface[]> {
    return this.repository.findAll();
  }
}
