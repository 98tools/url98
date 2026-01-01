import { Hono } from 'hono';
import type { AppBindings } from '../types/env';
import { LogCRUD } from '../crud/log.service';
import { UrlCRUD } from '../crud/url.service';

const logRoutes = new Hono<AppBindings>();

// Get logs by URL ID
logRoutes.get('/url/:urlId', async (c) => {
  // auth (only admin or owner of the URL can access)
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized', message: 'User must be logged in' }, 401);
    }
    const urlId = c.req.param('urlId');
    
    // Check if user is admin or owns the URL
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    
    if (!isAdmin) {
      // Fetch the URL to verify ownership
      const urlCRUD = new UrlCRUD(c.env.DB);
      const url = await urlCRUD.findById(urlId);
      
      if (!url) {
        return c.json({ error: 'URL not found' }, 404);
      }
      
      if (url.user_id !== user?.id) {
        return c.json({ error: 'Forbidden', message: 'You can only view logs for your own URLs' }, 403);
      }
    }

    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const logCRUD = new LogCRUD(c.env.DB);
    const logs = await logCRUD.findByUrlId(urlId, limit, offset);

    return c.json(logs);
  } catch (error) {
    return c.json({ error: 'Failed to fetch logs', details: (error as Error).message }, 500);
  }
});

export default logRoutes;
