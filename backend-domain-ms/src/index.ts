import { Hono } from 'hono';
import mainRoutes from './routes/main.routes';
import type { D1Database } from './types/cloudflare';

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'URL Shortener API',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Mount routes
app.route('/', mainRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;
