import { Hono } from 'hono';
import setupRoutes from './routes/health.routes';
import domainRoutes from './routes/domain.routes';
import urlRoutes from './routes/url.routes';
import logRoutes from './routes/log.routes';
import { authMiddleware } from './middleware/auth';
import type { AppBindings } from './types/env';

const app = new Hono<AppBindings>();

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'URL Shortener API',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Authenticated routes
app.use('/api/domains', authMiddleware);
app.use('/api/domains/*', authMiddleware);
app.use('/api/urls', authMiddleware);
app.use('/api/urls/*', authMiddleware);
app.use('/api/logs', authMiddleware);
app.use('/api/logs/*', authMiddleware);

// Mount routes
app.route('/api/health', setupRoutes);
app.route('/api/domains', domainRoutes);
app.route('/api/urls', urlRoutes);
app.route('/api/logs', logRoutes);

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
