import type { EventInterface } from './event.interface';
import type { EventRepository } from '../infrastructure/persistence/event.repository';
import { NotFoundError } from './errors';

export class DeleteEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  /** Devuelve el evento borrado, para que el transporte retire su imagen. */
  async execute(id: number): Promise<EventInterface> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe el evento con id ${id}`);
    }

    await this.repository.delete(id);
    return existing;
  }
}
