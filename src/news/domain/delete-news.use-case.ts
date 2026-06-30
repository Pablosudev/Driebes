import type { NewsRepository } from '../infrastructure/persistence/news.repository';
import { NotFoundError } from './errors';

export class DeleteNewsUseCase {
  constructor(private readonly repository: NewsRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la noticia con id ${id}`);
    }

    await this.repository.delete(id);
  }
}
