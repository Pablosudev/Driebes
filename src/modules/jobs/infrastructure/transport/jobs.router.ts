import { Router } from 'express';
import { CreateJobUseCase } from '../../domain/create-job.use-case';
import { ListJobsUseCase } from '../../domain/list-jobs.use-case';
import { GetJobByIdUseCase } from '../../domain/get-job-by-id.use-case';
import { ValidationError, NotFoundError } from '../../domain/errors';

interface JobsRouterDeps {
  createJob: CreateJobUseCase;
  listJobs: ListJobsUseCase;
  getJobById: GetJobByIdUseCase;
}

export function JobsRouter({ createJob, listJobs, getJobById }: JobsRouterDeps): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    try {
      const jobs = await listJobs.execute();
      res.status(200).json(jobs);
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      const job = await getJobById.execute(id);
      res.status(200).json(job);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const job = await createJob.execute({
        title: req.body?.title,
        description: req.body?.description,
        requirements: req.body?.requirements,
        companyName: req.body?.companyName,
        phone: req.body?.phone,
        email: req.body?.email,
      });
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
}
