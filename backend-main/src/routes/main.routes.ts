import { Hono } from 'hono';
import type { Env } from '../index';
import { UrlCRUD } from '../crud/url.service';
import { DomainCRUD } from '../crud/domain.service';
import { LogCRUD } from '../crud/log.service';

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
    const urls = await urlCRUD.findByDomainName(host);
    const urlObj = urls.find(u => u.keyword === keyword && u.active === 1);
    if (!urlObj) {
      return c.json({ error: 'URL not found for this domain and keyword' }, 404);
    }

    // Create log entry
    const logCRUD = new LogCRUD(c.env.DB);
    await logCRUD.create({
      url_id: urlObj.id,
      ip_address: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '',
      user_agent: c.req.header('user-agent') || '',
      referrer: c.req.header('referer') || '',
      country_code: c.req.header('cf-ipcountry') || '',
      country: '', // Could be enhanced with a geo IP service
      city: '',    // Could be enhanced with a geo IP service
      region: '',  // Could be enhanced with a geo IP service
    });
    
    // Redirect to destination
    return c.redirect(urlObj.url, 302);
  } catch (err) {
    return c.json({ error: 'Internal error', details: (err as Error).message }, 500);
  }
});

export default mainRoutes ;
