import type { NewInterface, NewInputInterface } from './news.interface';
import type { NewsRepository } from '../infrastructure/persistence/news.repository';
import { ValidationError, NotFoundError } from './errors';

export class UpdateNewsUseCase {
  constructor(private readonly repository: NewsRepository) {}

  async execute(id: number, input: Partial<NewInputInterface>): Promise<NewInterface> {
    const title = input.title?.trim();
    const description = input.description?.trim();

    if (!title || !description) {
      throw new ValidationError('El titulo y la descripción son obligatorios');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe la noticia con id ${id}`);
    }

    return this.repository.update(id, {
      title,
      description,
      image: input.image ?? existing.image,
      uploadDate: existing.uploadDate,
    });
  }
}
