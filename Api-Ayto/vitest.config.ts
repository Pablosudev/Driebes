import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      // Los tests usan siempre los repositorios en memoria, aunque el .env
      // active la persistencia en MySQL para desarrollo. Vitest define esta
      // variable antes de cargar los tests y dotenv no pisa las que ya existen,
      // así que este valor gana sobre el del .env.
      PERSISTENCE: 'memory',
      // Las subidas de los tests van al temporal del sistema, no al repo.
      UPLOADS_DIR: path.join(os.tmpdir(), 'api-ayto-test-uploads'),
    },
  },
});