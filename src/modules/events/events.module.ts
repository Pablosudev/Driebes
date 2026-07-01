import type { Router } from 'express';
import type { EventRepository } from './infrastructure/persistence/event.repository';
import { InMemoryEventRepository } from './infrastructure/persistence/event.repository';
import { PostgresEventRepository } from './infrastructure/persistence/postgres-event.repository';
import { getPrisma } from '../../db/prisma';
import { CreateEventUseCase } from './domain/create-event.use-case';
import { ListEventsUseCase } from './domain/list-events.use-case';
import { GetEventByIdUseCase } from './domain/get-event-by-id.use-case';
import { UpdateEventUseCase } from './domain/update-event.use-case';
import { DeleteEventUseCase } from './domain/delete-event.use-case';
import { EventsRouter } from './infrastructure/transport/events.router';

// Selecciona la implementación de persistencia. Por defecto, en memoria (los
// tests no tocan ninguna base de datos). Con PERSISTENCE=postgres usa Prisma.
function createEventRepository(): EventRepository {
  if (process.env.PERSISTENCE === 'postgres') {
    return new PostgresEventRepository(getPrisma());
  }
  return new InMemoryEventRepository();
}

export function buildEventsRouter(): Router {
  const repository = createEventRepository();

  return EventsRouter({
    createEvent: new CreateEventUseCase(repository),
    listEvents: new ListEventsUseCase(repository),
    getEventById: new GetEventByIdUseCase(repository),
    updateEvent: new UpdateEventUseCase(repository),
    deleteEvent: new DeleteEventUseCase(repository),
  });
}
