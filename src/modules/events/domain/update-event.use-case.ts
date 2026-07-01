import type { EventInterface, EventInputInterface } from './event.interface';
import type { EventRepository } from '../infrastructure/persistence/event.repository';
import { ValidationError, NotFoundError } from './errors';

export class UpdateEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(id: number, input: Partial<EventInputInterface>): Promise<EventInterface> {
    const title = input.title?.trim();
    const description = input.description?.trim();
    const eventDate = input.eventDate?.trim();
    const category = input.category;

    if (!title || !description || !eventDate || !category) {
      throw new ValidationError('title, description, eventDate y category son obligatorios');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe el evento con id ${id}`);
    }

    return this.repository.update(id, {
      title,
      description,
      image: input.image ?? existing.image,
      eventDate,
      category,
      creationDate: existing.creationDate,
    });
  }
}
