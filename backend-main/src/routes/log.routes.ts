import { Hono } from 'hono';
import type { Env } from '../index';
import { LogCRUD } from '../crud/log.service';

const logRoutes = new Hono<{ Bindings: Env }>();

// Create a new log entry
logRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { url_id, ip_address, user_agent, referrer, country_code, country, city, region } = body;

    if (!url_id) {
      return c.json({ error: 'url_id is required' }, 400);
    }

    const logCRUD = new LogCRUD(c.env.DB);
    const log = await logCRUD.create({
      url_id,
      ip_address,
      user_agent,
      referrer,
      country_code,
      country,
      city,
      region,
    });

    return c.json(log, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create log', details: (error as Error).message }, 500);
  }
});

// Get all logs
logRoutes.get('/', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const logCRUD = new LogCRUD(c.env.DB);
    const logs = await logCRUD.findAll(limit, offset);
    const total = await logCRUD.count();

    return c.json({
      data: logs,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch logs', details: (error as Error).message }, 500);
  }
});

// Get log by ID
logRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const logCRUD = new LogCRUD(c.env.DB);
    const log = await logCRUD.findById(id);

    if (!log) {
      return c.json({ error: 'Log not found' }, 404);
    }

    return c.json(log);
  } catch (error) {
    return c.json({ error: 'Failed to fetch log', details: (error as Error).message }, 500);
  }
});

// Get logs by URL ID
logRoutes.get('/url/:urlId', async (c) => {
  try {
    const urlId = c.req.param('urlId');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const logCRUD = new LogCRUD(c.env.DB);
    const logs = await logCRUD.findByUrlId(urlId, limit, offset);
    const total = await logCRUD.countByUrlId(urlId);

    return c.json({
      data: logs,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch logs', details: (error as Error).message }, 500);
  }
});

// Get logs by date range
logRoutes.get('/range/:startDate/:endDate', async (c) => {
  try {
    const startDate = parseInt(c.req.param('startDate'));
    const endDate = parseInt(c.req.param('endDate'));
    const limit = parseInt(c.req.query('limit') || '1000');
    const offset = parseInt(c.req.query('offset') || '0');

    const logCRUD = new LogCRUD(c.env.DB);
    const logs = await logCRUD.findByDateRange(startDate, endDate, limit, offset);

    return c.json({ data: logs });
  } catch (error) {
    return c.json({ error: 'Failed to fetch logs', details: (error as Error).message }, 500);
  }
});

// Get stats by country
logRoutes.get('/stats/country', async (c) => {
  try {
    const urlId = c.req.query('url_id');
    const logCRUD = new LogCRUD(c.env.DB);
    const stats = await logCRUD.getStatsByCountry(urlId || undefined);

    return c.json({ data: stats });
  } catch (error) {
    return c.json({ error: 'Failed to fetch stats', details: (error as Error).message }, 500);
  }
});

// Delete log
logRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const logCRUD = new LogCRUD(c.env.DB);
    const success = await logCRUD.delete(id);

    if (!success) {
      return c.json({ error: 'Log not found' }, 404);
    }

    return c.json({ message: 'Log deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete log', details: (error as Error).message }, 500);
  }
});

// Delete all logs for a URL
logRoutes.delete('/url/:urlId', async (c) => {
  try {
    const urlId = c.req.param('urlId');
    const logCRUD = new LogCRUD(c.env.DB);
    const success = await logCRUD.deleteByUrlId(urlId);

    if (!success) {
      return c.json({ error: 'Failed to delete logs' }, 404);
    }

    return c.json({ message: 'Logs deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete logs', details: (error as Error).message }, 500);
  }
});

export default logRoutes;
