import { Hono } from 'hono';
import type { Env } from '../index';
import { UrlCRUD } from '../crud/url.service';
import { LogCRUD } from '../crud/log.service';
import type { CreateLogInput } from '../models/log.model';

const mainRoutes = new Hono<{ Bindings: Env }>();


// forward to the URL associated with the keyword
mainRoutes.get('/:keyword', async (c) => {
  try {
    // Extract domain from host header
    const host = c.req.header('host');
    if (!host) {
      return c.json({ error: 'Host header missing' }, 400);
    }

    // Find url by domain_name and keyword
    const urlCRUD = new UrlCRUD(c.env.DB);
    const keyword = c.req.param('keyword');
    const urlObj = await urlCRUD.findByDomainNameAndKeyword(host, keyword);
    if (!urlObj) {
      return c.json({ error: 'URL not found for this domain and keyword' }, 404);
    }

    // Determine which fields to log based on urlObj.options JSON
    let logFields: string[] | null = null;
    try {
      const opts = JSON.parse(urlObj.options || '{}');
      if (Array.isArray(opts.logFields)) {
        logFields = opts.logFields;
      }
    } catch {}

    const logData: CreateLogInput = { url_id: urlObj.id };
    
    // Only store user info if logFields is explicitly defined in database
    if (logFields !== null) {
      if (logFields.includes('ip_address')) {
        logData.ip_address = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || null;
      }
      if (logFields.includes('user_agent')) {
        logData.user_agent = c.req.header('user-agent') || null;
      }
      if (logFields.includes('referrer')) {
        logData.referrer = c.req.header('referer') || null;
      }
      if (logFields.includes('country_code')) {
        logData.country_code = c.req.header('cf-ipcountry') || null;
      }
    }

    const logCRUD = new LogCRUD(c.env.DB);
    await logCRUD.create(logData);
    
    // Redirect to destination
    return c.redirect(urlObj.url, 307);
  } catch (err) {
    return c.json({ error: 'Internal error', details: (err as Error).message }, 500);
  }
});

export default mainRoutes ;
