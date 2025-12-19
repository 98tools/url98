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

  async findById(id: string): Promise<Log | null> {
    const result = await this.db
      .prepare('SELECT * FROM logs WHERE id = ?')
      .bind(id)
      .first<Log>();

    return result || null;
  }

  async findByUrlId(urlId: string, limit = 100, offset = 0): Promise<Log[]> {
    const result = await this.db
      .prepare('SELECT * FROM logs WHERE url_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?')
      .bind(urlId, limit, offset)
      .all<Log>();

    return result.results || [];
  }

  async findAll(limit = 100, offset = 0): Promise<Log[]> {
    const result = await this.db
      .prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?')
      .bind(limit, offset)
      .all<Log>();

    return result.results || [];
  }

  async findByDateRange(startDate: number, endDate: number, limit = 1000, offset = 0): Promise<Log[]> {
    const result = await this.db
      .prepare('SELECT * FROM logs WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT ? OFFSET ?')
      .bind(startDate, endDate, limit, offset)
      .all<Log>();

    return result.results || [];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM logs WHERE id = ?')
      .bind(id)
      .run();

    return result.success;
  }

  async deleteByUrlId(urlId: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM logs WHERE url_id = ?')
      .bind(urlId)
      .run();

    return result.success;
  }

  async count(): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM logs')
      .first<{ count: number }>();

    return result?.count || 0;
  }

  async countByUrlId(urlId: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM logs WHERE url_id = ?')
      .bind(urlId)
      .first<{ count: number }>();

    return result?.count || 0;
  }

  async getStatsByCountry(urlId?: string): Promise<Array<{ country: string; count: number }>> {
    let query = 'SELECT country, COUNT(*) as count FROM logs WHERE country IS NOT NULL';
    const params: any[] = [];

    if (urlId) {
      query += ' AND url_id = ?';
      params.push(urlId);
    }

    query += ' GROUP BY country ORDER BY count DESC';

    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<{ country: string; count: number }>();

    return result.results || [];
  }
}
