import type { D1Database } from '../types/cloudflare';
import type { Url } from '../models/url.model';
import { generateId } from '../utils/id';

export class UrlCRUD {
  constructor(private db: D1Database) {}

  async findByDomainNameAndKeyword(domainName: string, keyword: string): Promise<Url | null> {
    const result = await this.db
      .prepare('SELECT * FROM urls WHERE domain_name = ? AND keyword = ? AND active = 1')
      .bind(domainName, keyword)
      .first<Url>();

    return result || null;
  }
}
