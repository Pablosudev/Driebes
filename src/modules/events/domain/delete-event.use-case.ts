import type { EventInterface } from './event.interface';
import type { EventRepository } from '../infrastructure/persistence/event.repository';
import { NotFoundError } from './errors';

export class DeleteEventUseCase {
  constructor(private readonly repository: EventRepository) {}

  /**
   * Devuelve el evento que se ha borrado. El dominio no toca el disco, pero sí
   * informa de qué imagen colgaba de la fila para que el transporte —que es
   * quien creó el fichero— pueda retirarlo.
   */
  async execute(id: number): Promise<EventInterface> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`No existe el evento con id ${id}`);
    }

    await this.repository.delete(id);
    return existing;
  }
}
