import type { EventRepository } from '../infrastructure/persistence/event.repository';
import { NotFoundError } from './errors';

export class DeleteEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe el evento con id ${id}`);
    }

    await this.repository.delete(id);
  }
}
