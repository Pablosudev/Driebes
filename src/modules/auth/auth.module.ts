import type { Router } from 'express';
import type { UserInterface } from './domain/user.interface';
import type { UserRepository } from './infrastructure/persistence/user.repository';
import { InMemoryUserRepository } from './infrastructure/persistence/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { getPrisma } from '../../db/prisma';
import { BcryptPasswordHasher } from './infrastructure/security/password.hasher';
import { JwtTokenService } from './infrastructure/security/token.service';
import { LoginUseCase } from './domain/login.use-case';
import { GetMeUseCase } from './domain/get-me.use-case';
import { AuthRouter } from './infrastructure/transport/auth.router';
import { createRequireAuth } from '../../middleware/auth';

// Configuración del token JWT (ver docs/0001-diseno-api.md, sección 1).
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600; // segundos

// Administrador semilla, sobreescribible por variables de entorno.
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@ayto.local';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Administrador';

// Selecciona la implementación de persistencia. Por defecto, en memoria (los
// tests no tocan ninguna base de datos). Con PERSISTENCE=prisma usa la base de datos.
function createUserRepository(hasher: BcryptPasswordHasher): UserRepository {
  if (process.env.PERSISTENCE === 'prisma') {
    return new PrismaUserRepository(getPrisma());
  }

  // El admin semilla solo se crea en memoria (desarrollo/tests). En MySQL los
  // usuarios se crean mediante semilla/migración, fuera del alcance de aquí.
  const seedAdmin: UserInterface = {
    id: 1,
    email: SEED_ADMIN_EMAIL,
    name: SEED_ADMIN_NAME,
    passwordHash: hasher.hashSync(SEED_ADMIN_PASSWORD),
    createDate: new Date().toISOString(),
  };
  return new InMemoryUserRepository([seedAdmin]);
}

// Fuente única de la configuración JWT, compartida por el router de auth y por
// el middleware de protección global (app.ts).
export function createTokenService(): JwtTokenService {
  return new JwtTokenService(JWT_SECRET, JWT_EXPIRES_IN);
}

export function buildAuthRouter(): Router {
  const hasher = new BcryptPasswordHasher();
  const tokens = createTokenService();
  const users = createUserRepository(hasher);

  const login = new LoginUseCase(users, hasher, tokens);
  const getMe = new GetMeUseCase(users);
  return AuthRouter({ login, getMe, requireAuth: createRequireAuth(tokens) });
}
