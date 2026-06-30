import type { EventInterface, EventInputInterface } from '../../types/event.interface';
import type { EventRepository } from '../infrastructure/persistence/event.repository';
import { ValidationError } from './errors';

export class CreateEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(input: Partial<EventInputInterface>): Promise<EventInterface> {
    const title = input.title?.trim();
    const description = input.description?.trim();
    const eventDate = input.eventDate?.trim();
    const category = input.category;

    if (!title || !description || !eventDate || !category) {
      throw new ValidationError('title, description, eventDate y category son obligatorios');
    }

    return this.repository.save({
      title,
      description,
      image: input.image ?? null,
      eventDate,
      category,
      creationDate: new Date().toISOString(),
    });
  }
}
