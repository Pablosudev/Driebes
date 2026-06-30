import { Router } from 'express';
import formidable from 'formidable';
import { CreateEventUseCase } from '../../domain/create-event.use-case';
import { ListEventsUseCase } from '../../domain/list-events.use-case';
import { ValidationError } from '../../domain/errors';
import type { Category } from '../../../types/event.interface';

const primerValor = (campo: string | string[] | undefined): string | undefined =>
  Array.isArray(campo) ? campo[0] : campo;

interface EventsRouterDeps {
  createEvent: CreateEventUseCase;
  listEvents: ListEventsUseCase;
}

export function EventsRouter({ createEvent, listEvents }: EventsRouterDeps): Router {
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

  router.post('/', (req, res) => {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({ error: 'No se pudo procesar la petición' });
        return;
      }

      const fileImage = Array.isArray(files.image) ? files.image[0] : files.image;
      const image = fileImage
        ? `/uploads/events/${fileImage.originalFilename ?? fileImage.newFilename}`
        : null;

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

  return router;
}
