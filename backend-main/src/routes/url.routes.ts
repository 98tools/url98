import { Hono } from 'hono';
import type { AppBindings } from '../types/env';
import { UrlCRUD } from '../crud/url.service';

const urlRoutes = new Hono<AppBindings>();

// Create a new URL
urlRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    const { user_id, domain_name, url, title, keyword, description, ip_address, options } = body;

    if (!user_id || !domain_name || !url || !title || !keyword || !description) {
      return c.json(
        { error: 'user_id, domain_name, url, title, keyword, and description are required' },
        400
      );
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

// Get all URLs
urlRoutes.get('/', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const urlCRUD = new UrlCRUD(c.env.DB);
    const urls = await urlCRUD.findAll(limit, offset);
    const total = await urlCRUD.count();

    return c.json({
      data: urls,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch URLs', details: (error as Error).message }, 500);
  }
});

// Get top URLs by clicks
urlRoutes.get('/top', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const urlCRUD = new UrlCRUD(c.env.DB);
    const urls = await urlCRUD.getTopUrls(limit);

    return c.json({ data: urls });
  } catch (error) {
    return c.json({ error: 'Failed to fetch top URLs', details: (error as Error).message }, 500);
  }
});

// Get URL by ID
urlRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const urlCRUD = new UrlCRUD(c.env.DB);
    const url = await urlCRUD.findById(id);

    if (!url) {
      return c.json({ error: 'URL not found' }, 404);
    }

    return c.json(url);
  } catch (error) {
    return c.json({ error: 'Failed to fetch URL', details: (error as Error).message }, 500);
  }
});

// Get URL by keyword
urlRoutes.get('/keyword/:keyword', async (c) => {
  try {
    const keyword = c.req.param('keyword');
    const urlCRUD = new UrlCRUD(c.env.DB);
    const url = await urlCRUD.findByKeyword(keyword);

    if (!url) {
      return c.json({ error: 'URL not found' }, 404);
    }

    return c.json(url);
  } catch (error) {
    return c.json({ error: 'Failed to fetch URL', details: (error as Error).message }, 500);
  }
});

// Get URLs by user ID
urlRoutes.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const urlCRUD = new UrlCRUD(c.env.DB);
    const urls = await urlCRUD.findByUserId(userId, limit, offset);
    const total = await urlCRUD.countByUserId(userId);

    return c.json({
      data: urls,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch URLs', details: (error as Error).message }, 500);
  }
});

// Get URLs by domain name
urlRoutes.get('/domain/:domainName', async (c) => {
  try {
    const domainName = c.req.param('domainName');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const urlCRUD = new UrlCRUD(c.env.DB);
    const urls = await urlCRUD.findByDomainName(domainName, limit, offset);

    return c.json({ data: urls });
  } catch (error) {
    return c.json({ error: 'Failed to fetch URLs', details: (error as Error).message }, 500);
  }
});

// Update URL
urlRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const urlCRUD = new UrlCRUD(c.env.DB);
    const url = await urlCRUD.update(id, body);

    if (!url) {
      return c.json({ error: 'URL not found' }, 404);
    }

    return c.json(url);
  } catch (error) {
    return c.json({ error: 'Failed to update URL', details: (error as Error).message }, 500);
  }
});

// Increment URL clicks
urlRoutes.post('/:id/click', async (c) => {
  try {
    const id = c.req.param('id');
    const urlCRUD = new UrlCRUD(c.env.DB);
    const success = await urlCRUD.incrementClicks(id);

    if (!success) {
      return c.json({ error: 'URL not found' }, 404);
    }

    return c.json({ message: 'Click recorded successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to record click', details: (error as Error).message }, 500);
  }
});

// Delete URL
urlRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const urlCRUD = new UrlCRUD(c.env.DB);
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
