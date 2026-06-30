import express, { type Express } from 'express';
import { buildNewsRouter } from './news/news.module';
import { buildEventsRouter } from './events/events.module';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/news', buildNewsRouter());
  app.use('/events', buildEventsRouter());

  return app;
}
