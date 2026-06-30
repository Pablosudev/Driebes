import type { EventInterface, Category } from '../../types/event.interface';
import type { EventRepository } from '../infrastructure/persistence/event.repository';

export class ListEventsUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(category?: Category): Promise<EventInterface[]> {
    return this.repository.findAll(category);
  }
}
