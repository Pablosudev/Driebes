export interface UserInterface {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  createDate: string;
}

/**
 * Vista pública del usuario: la forma en que se expone hacia fuera.
 * Nunca incluye el hash de la contraseña (garantía a nivel de tipos).
 */
export type PublicUserInterface = Omit<UserInterface, 'passwordHash'>;

export function toPublicUser(user: UserInterface): PublicUserInterface {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createDate: user.createDate,
  };
}
