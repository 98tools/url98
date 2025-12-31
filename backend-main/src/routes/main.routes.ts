import { Hono } from 'hono';
import type { Env } from '../index';
import { UrlCRUD } from '../crud/url.service';
import { DomainCRUD } from '../crud/domain.service';

const mainRoutes = new Hono<{ Bindings: Env }>();


// forward to the URL associated with the keyword
mainRoutes.get('/:keyword', async (c) => {
  try {
    // 1. Extract domain from host header
    const host = c.req.header('host');
    if (!host) {
      return c.json({ error: 'Host header missing' }, 400);
    }

    // 2. Find domain by domain_string
    const domainCRUD = new DomainCRUD(c.env.DB);
    const domain = await domainCRUD.findByDomainString(host);
    if (!domain) {
      return c.json({ error: 'Domain not found' }, 404);
    }

    // 3. Find url by domain_id and keyword
    const urlCRUD = new UrlCRUD(c.env.DB);
    const keyword = c.req.param('keyword');
    const urls = await urlCRUD.findByDomainId(domain.id);
    const urlObj = urls.find(u => u.keyword === keyword && u.active === 1);
    if (!urlObj) {
      return c.json({ error: 'URL not found for this domain and keyword' }, 404);
    }

    // 4. Optionally increment clicks
    await urlCRUD.incrementClicks(urlObj.id);

    // 5. Redirect to destination
    return c.redirect(urlObj.url, 302);
  } catch (err) {
    return c.json({ error: 'Internal error', details: (err as Error).message }, 500);
  }
});

export default mainRoutes ;
