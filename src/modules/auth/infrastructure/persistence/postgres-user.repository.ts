import type { PrismaClient, User } from '../../../../generated/prisma/client';
import type { UserInterface } from '../../domain/user.interface';
import type { UserRepository } from './user.repository';

// Traduce una fila de Prisma (createDate como Date) a la entidad de dominio
// (createDate como cadena ISO 8601), que es el contrato de UserInterface.
function toUser(row: User): UserInterface {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    createDate: row.createDate.toISOString(),
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<UserInterface | null> {
    // Búsqueda case-insensitive, igual que la implementación en memoria.
    const row = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: 'insensitive' } },
    });
    return row ? toUser(row) : null;
  }

  async findById(id: number): Promise<UserInterface | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toUser(row) : null;
  }
}
