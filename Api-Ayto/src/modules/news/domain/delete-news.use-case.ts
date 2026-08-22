import type { NewInterface } from './news.interface';
import type { NewsRepository } from '../infrastructure/persistence/news.repository';
import { NotFoundError } from './errors';

export class DeleteNewsUseCase {
  constructor(private readonly repository: NewsRepository) {}

  /** Devuelve la noticia borrada, para que el transporte retire su imagen. */
  async execute(id: number): Promise<NewInterface> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la noticia con id ${id}`);
    }

    await this.repository.delete(id);
    return existing;
  }
}
