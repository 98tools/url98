import type { MiddlewareHandler } from 'hono';
import type { AppBindings, AuthUser } from '../types/env';

const buildUser = (payload: Record<string, unknown>): AuthUser | null => {
  const idCandidate = payload.id || payload.user_id || payload.userId;
  if (!idCandidate) return null;

  return {
    id: String(idCandidate),
    username: typeof payload.username === 'string' ? payload.username : undefined,
    mail: typeof payload.mail === 'string' ? payload.mail : typeof payload.email === 'string' ? payload.email : undefined,
    role: typeof payload.role === 'string' ? payload.role : undefined,
    raw: payload,
  };
};

export const authMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const authorization = c.req.header('authorization');

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing bearer token' }, 401);
  }

  try {
    const response = await fetch(`${c.env.AUTH_MS_URL}/api/v1/user_routers/user/me`, {
      method: 'GET',
      headers: {
        authorization,
      },
    });

    if (!response.ok) {
      return c.json({ error: 'Unauthorized', message: 'Token invalid or expired' }, 401);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const user = buildUser(payload);

    if (!user) {
      return c.json({ error: 'Unauthorized', message: 'User info missing in auth response' }, 401);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown authentication error';
    return c.json({ error: 'Auth service unreachable', message }, 503);
  }
};
