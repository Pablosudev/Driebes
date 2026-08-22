import type { EventInterface } from './event.interface';
import type { EventRepository } from '../infrastructure/persistence/event.repository';
import { NotFoundError } from './errors';

export class GetEventByIdUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(id: number): Promise<EventInterface> {
    const event = await this.repository.findById(id);

    if (!event) {
      throw new NotFoundError(`No existe el evento con id ${id}`);
    }

    return event;
  }
}
