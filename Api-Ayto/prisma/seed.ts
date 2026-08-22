import 'dotenv/config';
import { getPrisma } from '../src/db/prisma';
import { BcryptPasswordHasher } from '../src/modules/auth/infrastructure/security/password.hasher';

// Siembra el administrador inicial. En memoria lo crea auth.module.ts al
// arrancar; contra la base de datos hay que insertarlo explícitamente.
// Mismas variables de entorno que auth.module.ts, para que las credenciales
// coincidan con las que ya usan los tests y el entorno de desarrollo.
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@ayto.local';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Administrador';

async function main(): Promise<void> {
  const prisma = getPrisma();
  const hasher = new BcryptPasswordHasher();

  // Idempotente: re-ejecutar la semilla no duplica el admin ni pisa su
  // contraseña si alguien ya la ha cambiado en la base de datos.
  const existing = await prisma.user.findFirst({
    where: { email: { equals: SEED_ADMIN_EMAIL } },
  });

  if (existing) {
    console.log(`El admin "${SEED_ADMIN_EMAIL}" ya existe (id ${existing.id}). Nada que hacer.`);
    return;
  }

  const created = await prisma.user.create({
    data: {
      email: SEED_ADMIN_EMAIL,
      name: SEED_ADMIN_NAME,
      passwordHash: await hasher.hash(SEED_ADMIN_PASSWORD),
    },
  });

  console.log(`Admin creado: ${created.email} (id ${created.id}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
