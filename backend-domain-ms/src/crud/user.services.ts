import type { D1Database } from '../types/cloudflare';
import type { Url } from '../models/url.model';

export class UserCRUD {
  constructor(private db: D1Database) {}

  async getUserPoints(userID: string): Promise<string | null> {
    const result = await this.db
      .prepare('SELECT current_points FROM users WHERE id = ?')
      .bind(userID)
      .first<{ current_points: string }>();


    return result?.current_points || null;
  }

  async deductPoint(userID: string): Promise<void> {
    await this.db
      .prepare('UPDATE users SET current_points = current_points - 1 WHERE id = ?')
      .bind(userID)
      .run();
  }
  
  async insertRequest(userID: string, shortUrl: string): Promise<string> {
    const requestID = crypto.randomUUID();
    const createdAt = new Date().toISOString().replace('Z', '000+00:00');
    
    await this.db
        .prepare('INSERT INTO requests (id, user_id, tool_name, request_data, request_point_cost, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(requestID, userID, "url-shortener", `1 click on url ${shortUrl}`, 1, createdAt)
        .run();
    return requestID;
  }
}
