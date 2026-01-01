import { Hono } from 'hono';
import type { AppBindings } from '../types/env';

const setupRoutes = new Hono<AppBindings>();

// Basic health check
setupRoutes.get('/', (c) => {
  return c.json({
    status: 'healthy',
    message: 'API is running',
  });
});

// Health check for database
setupRoutes.get('/database', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT 1 as health').first();
    
    return c.json({
      status: 'healthy',
      database: result ? 'connected' : 'disconnected',
    });
  } catch (error) {
    return c.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: (error as Error).message,
      },
      500
    );
  }
});

export default setupRoutes;
