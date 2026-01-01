import type { D1Database } from './cloudflare';

export interface Env {
  DB: D1Database;
  AUTH_MS_URL: string;
}

export interface AuthUser {
  id: string;
  username?: string;
  mail?: string;
  role?: string;
  // Keep a copy of the payload for future claims without strict typing
  raw?: unknown;
}

export type AppBindings = {
  Bindings: Env;
  Variables: {
    user: AuthUser;
  };
};
