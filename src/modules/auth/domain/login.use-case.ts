import { toPublicUser, type PublicUserInterface } from './user.interface';
import type { UserRepository } from '../infrastructure/persistence/user.repository';
import type { PasswordHasher } from '../infrastructure/security/password.hasher';
import type { TokenService } from '../infrastructure/security/token.service';
import { ValidationError, InvalidCredentialsError } from './errors';

export interface LoginInput {
  email?: unknown;
  password?: unknown;
}

export interface LoginResult {
  token: string;
  user: PublicUserInterface;
}

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const email = typeof input.email === 'string' ? input.email.trim() : '';
    const password = typeof input.password === 'string' ? input.password : '';

    if (!email || !password) {
      throw new ValidationError('Email y contraseña son obligatorios');
    }

    const user = await this.users.findByEmail(email);
    // Mismo error para "no existe" y "contraseña incorrecta": no revelamos cuál falla.
    if (!user || !(await this.hasher.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokens.sign({ sub: user.id, email: user.email });
    return { token, user: toPublicUser(user) };
  }
}
