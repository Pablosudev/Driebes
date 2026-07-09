import { Router, type RequestHandler } from 'express';
import { LoginUseCase } from '../../domain/login.use-case';
import { GetMeUseCase } from '../../domain/get-me.use-case';
import { ValidationError, InvalidCredentialsError, NotFoundError } from '../../domain/errors';

interface AuthRouterDeps {
  login: LoginUseCase;
  getMe: GetMeUseCase;
  requireAuth: RequestHandler;
}

export function AuthRouter({ login, getMe, requireAuth }: AuthRouterDeps): Router {
  const router = Router();

  router.post('/login', async (req, res) => {
    try {
      const result = await login.execute({
        email: req.body?.email,
        password: req.body?.password,
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.get('/me', requireAuth, async (req, res) => {
    try {
      const auth = req.auth;
      if (!auth) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const user = await getMe.execute(auth.sub);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(401).json({ error: 'Sesión no válida' });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/logout', requireAuth, (_req, res) => {
    // JWT stateless: el cierre de sesión efectivo lo hace el cliente al descartar
    // el token. Aquí solo confirmamos que la petición está autenticada.
    res.status(200).json({ message: 'Sesión cerrada' });
  });

  return router;
}
