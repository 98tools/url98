import { Hono } from 'hono';
import type { Env } from '../index';

const setupRoutes = new Hono<{ Bindings: Env }>();

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
