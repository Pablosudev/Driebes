import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Cliente de Prisma compartido por los repositorios Postgres.
// Prisma 7 conecta mediante un driver adapter (@prisma/adapter-pg, que usa pg).
// Se instancia de forma perezosa: los tests (persistencia en memoria) nunca crean
// el cliente ni necesitan una base de datos.
let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!client) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    client = new PrismaClient({ adapter });
  }
  return client;
}
