import { Router } from 'express';
import { CreateJobUseCase } from '../../domain/create-job.use-case';
import { ListJobsUseCase } from '../../domain/list-jobs.use-case';
import { GetJobByIdUseCase } from '../../domain/get-job-by-id.use-case';
import { UpdateJobUseCase } from '../../domain/update-job.use-case';
import { DeleteJobUseCase } from '../../domain/delete-job.use-case';
import { ValidationError, NotFoundError } from '../../domain/errors';

interface JobsRouterDeps {
  createJob: CreateJobUseCase;
  listJobs: ListJobsUseCase;
  getJobById: GetJobByIdUseCase;
  updateJob: UpdateJobUseCase;
  deleteJob: DeleteJobUseCase;
}

export function JobsRouter({
  createJob,
  listJobs,
  getJobById,
  updateJob,
  deleteJob,
}: JobsRouterDeps): Router {
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

  router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      const job = await updateJob.execute(id, {
        title: req.body?.title,
        description: req.body?.description,
        requirements: req.body?.requirements,
        companyName: req.body?.companyName,
        phone: req.body?.phone,
        email: req.body?.email,
      });
      res.status(200).json(job);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      await deleteJob.execute(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  return router;
}
