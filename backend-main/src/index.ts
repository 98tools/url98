import { Hono } from 'hono';
import { cors } from 'hono/cors';
import setupRoutes from './routes/health.routes';
import domainRoutes from './routes/domain.routes';
import urlRoutes from './routes/url.routes';
import logRoutes from './routes/log.routes';
import openRoutes from './routes/open.routes';
import { authMiddleware } from './middleware/auth';
import type { AppBindings } from './types/env';

const app = new Hono<AppBindings>();

// Global CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
}));

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

// Explicit OPTIONS handler (in case some proxies bypass middleware order)
app.options('*', (c) => c.text('', 204));

// Mount routes
app.route('/api/health', setupRoutes);
app.route('/api/domains', domainRoutes);
app.route('/api/urls', urlRoutes);
app.route('/api/logs', logRoutes);
app.route('/api/open', openRoutes);

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
