import type { D1Database } from '../types/cloudflare';
import type { Log, CreateLogInput } from '../models/log.model';
import { generateId } from '../utils/id';

export class LogCRUD {
  constructor(private db: D1Database) {}

  async findByUrlId(urlId: string, limit = 100, offset = 0): Promise<Log[]> {
    const result = await this.db
      .prepare('SELECT * FROM logs WHERE url_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?')
      .bind(urlId, limit, offset)
      .all<Log>();

    return (result && result.results) || [];
  }
}
