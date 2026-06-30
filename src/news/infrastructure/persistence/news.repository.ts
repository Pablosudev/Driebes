import type { NewInterface } from "../../../types/news.interface"


export interface NewsRepository {
  save(data: Omit<NewInterface, 'id'>): Promise<NewInterface>;
  findAll(): Promise<NewInterface[]>;
  findById(id: number): Promise<NewInterface | null>;
  update(id: number, data: Omit<NewInterface, 'id'>): Promise<NewInterface>;
  delete(id: number): Promise<void>;
}


export class InMemoryNewsRepository implements NewsRepository {
  private news: Map<number, NewInterface> = new Map();
  private nextId: number = 1;

  async save(data: Omit<NewInterface, 'id'>): Promise<NewInterface> {
    const news: NewInterface = { id: this.nextId++, ...data };
    this.news.set(news.id, news);
    return news;
  }

  async findAll(): Promise<NewInterface[]> {
    return Array.from(this.news.values());
  }

  async findById(id: number): Promise<NewInterface | null> {
    return this.news.get(id) ?? null;
  }

  async update(id: number, data: Omit<NewInterface, 'id'>): Promise<NewInterface> {
    const updated: NewInterface = { id, ...data };
    this.news.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.news.delete(id);
  }
}
