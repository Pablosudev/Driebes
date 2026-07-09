import { toPublicUser, type PublicUserInterface } from './user.interface';
import type { UserRepository } from '../infrastructure/persistence/user.repository';
import { NotFoundError } from './errors';

export class GetMeUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: number): Promise<PublicUserInterface> {
    const user = await this.users.findById(userId);
    if (!user) {
      // Token válido pero el usuario ya no existe (p. ej. eliminado).
      throw new NotFoundError('Usuario no encontrado');
    }
    return toPublicUser(user);
  }
}
