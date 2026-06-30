import type { EventInterface, Category } from '../../../types/event.interface';

export interface EventRepository {
  save(data: Omit<EventInterface, 'id'>): Promise<EventInterface>;
  findAll(category?: Category): Promise<EventInterface[]>;
}

export class InMemoryEventRepository implements EventRepository {
  private events: Map<number, EventInterface> = new Map();
  private nextId: number = 1;

  async save(data: Omit<EventInterface, 'id'>): Promise<EventInterface> {
    const event: EventInterface = { id: this.nextId++, ...data };
    this.events.set(event.id, event);
    return event;
  }

  async findAll(category?: Category): Promise<EventInterface[]> {
    const all = Array.from(this.events.values());
    return category ? all.filter((event) => event.category === category) : all;
  }
}
