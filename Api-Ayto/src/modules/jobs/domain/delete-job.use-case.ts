import type { JobRepository } from '../infrastructure/persistence/job.repository';
import { NotFoundError } from './errors';

export class DeleteJobUseCase {
  constructor(private readonly repository: JobRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la oferta con id ${id}`);
    }

    await this.repository.delete(id);
  }
}
