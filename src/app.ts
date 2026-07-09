import express, { type Express } from 'express';
import { buildNewsRouter } from './modules/news/news.module';
import { buildEventsRouter } from './modules/events/events.module';
import { buildBookingsRouter } from './modules/bookings/bookings.module';
import { buildAuthRouter, createTokenService } from './modules/auth/auth.module';
import { buildJobsRouter } from './modules/jobs/jobs.module';
import { createRequireAuth } from './middleware/auth';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Endpoints públicos (sin token).
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/auth', buildAuthRouter());

  // Resto de recursos: requieren JWT válido (docs/0001-diseno-api.md, sección 1).
  const requireAuth = createRequireAuth(createTokenService());
  app.use('/news', requireAuth, buildNewsRouter());
  app.use('/events', requireAuth, buildEventsRouter());
  app.use('/bookings', requireAuth, buildBookingsRouter());
  app.use('/jobs', requireAuth, buildJobsRouter());

  return app;
}
