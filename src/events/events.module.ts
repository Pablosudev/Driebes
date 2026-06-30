import type { Router } from 'express';
import { InMemoryEventRepository } from './infrastructure/persistence/event.repository';
import { CreateEventUseCase } from './domain/create-event.use-case';
import { ListEventsUseCase } from './domain/list-events.use-case';
import { EventsRouter } from './infrastructure/transport/events.router';

export function buildEventsRouter(): Router {
  const repository = new InMemoryEventRepository();

  return EventsRouter({
    createEvent: new CreateEventUseCase(repository),
    listEvents: new ListEventsUseCase(repository),
  });
}
