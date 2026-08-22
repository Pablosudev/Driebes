import type { EventInterface, Category } from '../../domain/event.interface';

export interface EventRepository {
  save(data: Omit<EventInterface, 'id'>): Promise<EventInterface>;
  findAll(category?: Category): Promise<EventInterface[]>;
  findById(id: number): Promise<EventInterface | null>;
  update(id: number, data: Omit<EventInterface, 'id'>): Promise<EventInterface>;
  delete(id: number): Promise<void>;
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

  async findById(id: number): Promise<EventInterface | null> {
    return this.events.get(id) ?? null;
  }

  async update(id: number, data: Omit<EventInterface, 'id'>): Promise<EventInterface> {
    const updated: EventInterface = { id, ...data };
    this.events.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.events.delete(id);
  }
}
