import type { NewInterface, NewInputInterface } from './news.interface';
import type { NewsRepository } from '../infrastructure/persistence/news.repository';
import { ValidationError } from './errors';

// Capa de DOMINIO.
// Un Use Case representa una acción de negocio: aquí, "crear una noticia".
// Contiene las reglas de negocio (validación, fecha de subida) y delega el
// almacenamiento en el repositorio que recibe por inyección de dependencias.
export class CreateNewsUseCase {
  constructor(private readonly repository: NewsRepository) {}

  async execute(input: Partial<NewInputInterface>): Promise<NewInterface> {
    const title = input.title?.trim();
    const description = input.description?.trim();

    if (!title || !description) {
      throw new ValidationError('El titulo y la descripción son obligatorios');
    }

    return this.repository.save({
      title,
      description,
      image: input.image ?? null,
      uploadDate: new Date().toISOString(),
    });
  }
}
