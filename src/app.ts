import express, { type Express } from 'express';
import { InMemoryNoticiaRepository } from './noticias/infrastructure/persistence/noticia.repository';
import { CrearNoticiaUseCase } from './noticias/domain/crear-noticia.use-case';
import { crearNoticiasRouter } from './noticias/infrastructure/transport/noticias.router';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ─────────────────────────────────────────
  // NOTICIAS
  // ─────────────────────────────────────────
  // Composición de las 3 capas (composition root): se elige la implementación
  // de persistencia, se inyecta en el use case y este en el router de transporte.
  const noticiaRepository = new InMemoryNoticiaRepository();
  const crearNoticia = new CrearNoticiaUseCase(noticiaRepository);

  app.use('/noticias', crearNoticiasRouter(crearNoticia));

  return app;
}
