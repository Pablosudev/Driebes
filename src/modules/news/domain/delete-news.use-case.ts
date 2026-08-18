import type { NewInterface } from './news.interface';
import type { NewsRepository } from '../infrastructure/persistence/news.repository';
import { NotFoundError } from './errors';

export class DeleteNewsUseCase {
  constructor(private readonly repository: NewsRepository) {}

  /**
   * Devuelve la noticia que se ha borrado. El dominio no toca el disco, pero sí
   * informa de qué imagen colgaba de la fila para que el transporte —que es
   * quien creó el fichero— pueda retirarlo.
   */
  async execute(id: number): Promise<NewInterface> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la noticia con id ${id}`);
    }

    await this.repository.delete(id);
    return existing;
  }
}
