import type { UserInterface } from '../../domain/user.interface';

export interface UserRepository {
  findByEmail(email: string): Promise<UserInterface | null>;
  findById(id: number): Promise<UserInterface | null>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<number, UserInterface> = new Map();

  constructor(seed: UserInterface[] = []) {
    for (const user of seed) {
      this.users.set(user.id, user);
    }
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) return user;
    }
    return null;
  }

  async findById(id: number): Promise<UserInterface | null> {
    return this.users.get(id) ?? null;
  }
}
