import express, { type Express } from 'express';
import { buildNewsRouter } from './modules/news/news.module';
import { buildEventsRouter } from './modules/events/events.module';
import { buildBookingsRouter } from './modules/bookings/bookings.module';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/news', buildNewsRouter());
  app.use('/events', buildEventsRouter());
  app.use('/bookings', buildBookingsRouter());

  return app;
}
