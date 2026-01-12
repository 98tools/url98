import { Hono } from 'hono';
import type { AppBindings } from '../types/env';
import { DomainCRUD } from '../crud/domain.service';

const openRoutes = new Hono<AppBindings>();

// Get all domains
openRoutes.get('/get-domains', async (c) => {
  // No auth required for fetching domains
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const domainCRUD = new DomainCRUD(c.env.DB);
    const domains = await domainCRUD.findAll(limit, offset);

    return c.json(domains);
  } catch (error) {
    return c.json({ error: 'Failed to fetch domains', details: (error as Error).message }, 500);
  }
});

export default openRoutes;
