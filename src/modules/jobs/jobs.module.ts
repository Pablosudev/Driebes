import type { Router } from 'express';
import type { JobRepository } from './infrastructure/persistence/job.repository';
import { InMemoryJobRepository } from './infrastructure/persistence/job.repository';
import { PostgresJobRepository } from './infrastructure/persistence/postgres-job.repository';
import { getPrisma } from '../../db/prisma';
import { CreateJobUseCase } from './domain/create-job.use-case';
import { ListJobsUseCase } from './domain/list-jobs.use-case';
import { GetJobByIdUseCase } from './domain/get-job-by-id.use-case';
import { UpdateJobUseCase } from './domain/update-job.use-case';
import { DeleteJobUseCase } from './domain/delete-job.use-case';
import { JobsRouter } from './infrastructure/transport/jobs.router';

// Selecciona la implementación de persistencia. Por defecto, en memoria (los
// tests no tocan ninguna base de datos). Con PERSISTENCE=postgres usa Prisma.
function createJobRepository(): JobRepository {
  if (process.env.PERSISTENCE === 'postgres') {
    return new PostgresJobRepository(getPrisma());
  }
  return new InMemoryJobRepository();
}

export function buildJobsRouter(): Router {
  const repository = createJobRepository();

  return JobsRouter({
    createJob: new CreateJobUseCase(repository),
    listJobs: new ListJobsUseCase(repository),
    getJobById: new GetJobByIdUseCase(repository),
    updateJob: new UpdateJobUseCase(repository),
    deleteJob: new DeleteJobUseCase(repository),
  });
}
