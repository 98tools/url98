import { Hono } from 'hono';
import type { AppBindings } from '../types/env';
import { UrlCRUD } from '../crud/url.service';
import { DomainCRUD } from '../crud/domain.service';

const urlRoutes = new Hono<AppBindings>();

// Create a new URL
urlRoutes.post('/', async (c) => {
  // auth (user must be logged in)
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized', message: 'User must be logged in' }, 401);
  }
  try {
    const body = await c.req.json();
  
    const user_id = user.id;
    const ip_address = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '';
    const { domain_name, url, title, keyword, description, options } = body;
    
    if (!user_id || !domain_name || !url || !title || !keyword || !description) {
      return c.json(
        { error: 'user_id, domain_name, url, title, keyword, and description are required' },
        400
      );
    }

    // Check if the domain_name is stored in the database, if not, return error
    const domainCRUD = new DomainCRUD(c.env.DB);
    const domainExists = await domainCRUD.findByDomainName(domain_name);
    if (!domainExists) {
      return c.json({ error: 'Domain not found' }, 404);
    }
    
    const urlCRUD = new UrlCRUD(c.env.DB);
    const newUrl = await urlCRUD.create({
      user_id,
      domain_name,
      url,
      title,
      keyword,
      description,
      ip_address,
      options,
    });

    return c.json(newUrl, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create URL', details: (error as Error).message }, 500);
  }
});

// Get all URLs for specific user
urlRoutes.get('/', async (c) => {
  // auth (user must be logged in)
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized', message: 'User must be logged in' }, 401);
  }
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const urlCRUD = new UrlCRUD(c.env.DB);
    const urls = await urlCRUD.findByUserId(user.id, limit, offset);

    return c.json(urls);
  } catch (error) {
    return c.json({ error: 'Failed to fetch URLs', details: (error as Error).message }, 500);
  }
});

// Update URL
urlRoutes.put('/:id', async (c) => {
  // auth (only admin or owner of the URL can access)
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized', message: 'User must be logged in' }, 401);
  }
  const id = c.req.param('id');
  
  try {
    const urlCRUD = new UrlCRUD(c.env.DB);
    
    // Check if user is admin or owns the URL
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    
    if (!isAdmin) {
      // Fetch the URL to verify ownership
      const existingUrl = await urlCRUD.findById(id);
      
      if (!existingUrl) {
        return c.json({ error: 'URL not found' }, 404);
      }
      
      if (existingUrl.user_id !== user?.id) {
        return c.json({ error: 'Forbidden', message: 'You can only update your own URLs' }, 403);
      }
    }
    
    const body = await c.req.json();
    const url = await urlCRUD.update(id, body);

    if (!url) {
      return c.json({ error: 'URL not found' }, 404);
    }

    return c.json(url);
  } catch (error) {
    return c.json({ error: 'Failed to update URL', details: (error as Error).message }, 500);
  }
});

// Delete URL
urlRoutes.delete('/:id', async (c) => {
  // auth (only admin or owner of the URL can access)
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized', message: 'User must be logged in' }, 401);
  }
  const id = c.req.param('id');

  try {
    const urlCRUD = new UrlCRUD(c.env.DB);
    
    // Check if user is admin or owns the URL
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    
    if (!isAdmin) {
      // Fetch the URL to verify ownership
      const existingUrl = await urlCRUD.findById(id);
      
      if (!existingUrl) {
        return c.json({ error: 'URL not found' }, 404);
      }
      
      if (existingUrl.user_id !== user?.id) {
        return c.json({ error: 'Forbidden', message: 'You can only delete your own URLs' }, 403);
      }
    }
    
    const success = await urlCRUD.delete(id);

    if (!success) {
      return c.json({ error: 'URL not found' }, 404);
    }

    return c.json({ message: 'URL deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete URL', details: (error as Error).message }, 500);
  }
});

export default urlRoutes;
