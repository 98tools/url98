import { Hono } from 'hono';
import type { AppBindings } from '../types/env';
import { DomainCRUD } from '../crud/domain.service';

const domainRoutes = new Hono<AppBindings>();

// Create a new domain
domainRoutes.post('/', async (c) => {
  // auth (only admin can access)
  try {
    const user = c.get('user');
    if (!user || String(user.role).toLowerCase() !== 'admin') {
      return c.json({ error: 'Forbidden', message: 'Admin role required' }, 403);
    }

    const body = await c.req.json();
    const { domain_name } = body;

    if (!domain_name) {
      return c.json({ error: 'domain_name is required' }, 400);
    }

    const domainCRUD = new DomainCRUD(c.env.DB);
    const domain = await domainCRUD.create({ domain_name });

    return c.json(domain, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create domain', details: (error as Error).message }, 500);
  }
});

// Get all domains
domainRoutes.get('/', async (c) => {
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

// Update domain
domainRoutes.put('/:id', async (c) => {
  // auth (only admin can access)
  const user = c.get('user');
  if (!user || String(user.role).toLowerCase() !== 'admin') {
    return c.json({ error: 'Forbidden', message: 'Admin role required' }, 403);
  }

  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const domainCRUD = new DomainCRUD(c.env.DB);
    const domain = await domainCRUD.update(id, body);

    if (!domain) {
      return c.json({ error: 'Domain not found' }, 404);
    }

    return c.json(domain);
  } catch (error) {
    return c.json({ error: 'Failed to update domain', details: (error as Error).message }, 500);
  }
});

// Delete domain
domainRoutes.delete('/:id', async (c) => {
  // auth (only admin can access)
  const user = c.get('user');
  if (!user || String(user.role).toLowerCase() !== 'admin') {
    return c.json({ error: 'Forbidden', message: 'Admin role required' }, 403);
  }

  try {
    const id = c.req.param('id');
    const domainCRUD = new DomainCRUD(c.env.DB);
    const success = await domainCRUD.delete(id);

    if (!success) {
      return c.json({ error: 'Domain not found' }, 404);
    }

    return c.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete domain', details: (error as Error).message }, 500);
  }
});

export default domainRoutes;
