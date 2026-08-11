import { Router, type RequestHandler } from 'express';
import { createUploadForm, rutaPublica } from '../../../../utils/uploads';
import { CreateEventUseCase } from '../../domain/create-event.use-case';
import { ListEventsUseCase } from '../../domain/list-events.use-case';
import { GetEventByIdUseCase } from '../../domain/get-event-by-id.use-case';
import { UpdateEventUseCase } from '../../domain/update-event.use-case';
import { DeleteEventUseCase } from '../../domain/delete-event.use-case';
import { ValidationError, NotFoundError } from '../../domain/errors';
import type { Category } from '../../domain/event.interface';

const primerValor = (campo: string | string[] | undefined): string | undefined =>
  Array.isArray(campo) ? campo[0] : campo;

interface EventsRouterDeps {
  requireAuth: RequestHandler;
  createEvent: CreateEventUseCase;
  listEvents: ListEventsUseCase;
  getEventById: GetEventByIdUseCase;
  updateEvent: UpdateEventUseCase;
  deleteEvent: DeleteEventUseCase;
}

export function EventsRouter({
  requireAuth,
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
}: EventsRouterDeps): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const category =
        typeof req.query.category === 'string' ? (req.query.category as Category) : undefined;
      const events = await listEvents.execute(category);
      res.status(200).json(events);
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
      const event = await getEventById.execute(id);
      res.status(200).json(event);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/', requireAuth, (req, res) => {
    const form = createUploadForm('events');

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'No se pudo procesar la petición' });
        return;
      }

      const fileImage = Array.isArray(files.image) ? files.image[0] : files.image;
      const image = rutaPublica('events', fileImage);

      try {
        const event = await createEvent.execute({
          title: primerValor(fields.title),
          description: primerValor(fields.description),
          eventDate: primerValor(fields.eventDate),
          category: primerValor(fields.category) as Category | undefined,
          image,
        });

        res.status(201).json(event);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    });
  });

  router.put('/:id', requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const form = createUploadForm('events');

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'No se pudo procesar la petición' });
        return;
      }

      const fileImage = Array.isArray(files.image) ? files.image[0] : files.image;
      const image = rutaPublica('events', fileImage);

      try {
        const event = await updateEvent.execute(id, {
          title: primerValor(fields.title),
          description: primerValor(fields.description),
          eventDate: primerValor(fields.eventDate),
          category: primerValor(fields.category) as Category | undefined,
          image,
        });

        res.status(200).json(event);
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
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    try {
      await deleteEvent.execute(id);
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
