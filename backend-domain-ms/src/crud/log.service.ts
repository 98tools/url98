import type { D1Database } from '../types/cloudflare';
import type { Log, CreateLogInput } from '../models/log.model';
import { generateId } from '../utils/id';

export class LogCRUD {
  constructor(private db: D1Database) {}

  async create(input: CreateLogInput): Promise<Log> {
    const now = Date.now();
    const id = generateId();
    
    await this.db
      .prepare(
        `INSERT INTO logs (id, url_id, timestamp, ip_address, user_agent, referrer, country_code, country, city, region)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        input.url_id,
        now,
        input.ip_address || null,
        input.user_agent || null,
        input.referrer || null,
        input.country_code || null,
        input.country || null,
        input.city || null,
        input.region || null
      )
      .run();

    return {
      id,
      url_id: input.url_id,
      timestamp: now,
      ip_address: input.ip_address || null,
      user_agent: input.user_agent || null,
      referrer: input.referrer || null,
      country_code: input.country_code || null,
      country: input.country || null,
      city: input.city || null,
      region: input.region || null,
    };
  }
}
