import type { JobInterface } from '../../domain/job.interface';

export interface JobRepository {
  save(data: Omit<JobInterface, 'id'>): Promise<JobInterface>;
  findAll(): Promise<JobInterface[]>;
  findById(id: number): Promise<JobInterface | null>;
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
}
