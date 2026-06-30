import type { NewInterface } from '../../types/news.interface';
import type { NewsRepository } from '../infrastructure/persistence/news.repository';
import { NotFoundError } from './errors';

// Capa de DOMINIO.
// Un Use Case representa una acción de negocio: aquí, "obtener una noticia por id".
// La regla de negocio es: si la noticia no existe, es un error de dominio
// (NotFoundError). El repositorio solo devuelve el dato o null; es el use case
// quien decide que "no encontrada" es una situación excepcional.
export class GetNewsByIdUseCase {
  constructor(private readonly repositorio: NewsRepository) {}

  async execute(id: number): Promise<NewInterface> {
    const news = await this.repositorio.findById(id);

    if (!news) {
      throw new NotFoundError(`No existe la noticia con id ${id}`);
    }

    return news;
  }
}
