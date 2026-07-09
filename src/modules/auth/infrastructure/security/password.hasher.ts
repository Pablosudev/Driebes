import bcrypt from 'bcrypt';

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

/**
 * Hash de contraseñas con bcrypt (docs/0001-diseno-api.md, sección 1).
 * bcrypt genera y almacena la sal dentro del propio hash.
 */
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 10;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Versión síncrona, reservada para sembrar usuarios al arrancar la app
   * (createApp() es síncrono). No usar en el flujo de peticiones.
   */
  hashSync(plain: string): string {
    return bcrypt.hashSync(plain, this.saltRounds);
  }
}
