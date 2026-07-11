import type { JobInterface } from '../../domain/job.interface';

export interface JobRepository {
  save(data: Omit<JobInterface, 'id'>): Promise<JobInterface>;
  findAll(): Promise<JobInterface[]>;
  findById(id: number): Promise<JobInterface | null>;
  update(id: number, data: Omit<JobInterface, 'id' | 'createDate'>): Promise<JobInterface | null>;
  delete(id: number): Promise<void>;
}

export class InMemoryJobRepository implements JobRepository {
  private jobs: Map<number, JobInterface> = new Map();
  private nextId: number = 1;

  async save(data: Omit<JobInterface, 'id'>): Promise<JobInterface> {
    const job: JobInterface = { id: this.nextId++, ...data };
    this.jobs.set(job.id, job);
    return job;
  }

  async findAll(): Promise<JobInterface[]> {
    return Array.from(this.jobs.values());
  }

  async findById(id: number): Promise<JobInterface | null> {
    return this.jobs.get(id) ?? null;
  }

  async update(id: number, data: Omit<JobInterface, 'id' | 'createDate'>): Promise<JobInterface | null> {
    const current = this.jobs.get(id);
    if (!current) {
      return null;
    }

    const updated: JobInterface = { ...current, ...data };
    this.jobs.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.jobs.delete(id);
  }
}
