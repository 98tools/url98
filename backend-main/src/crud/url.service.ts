import type { D1Database } from '../types/cloudflare';
import type { Url, CreateUrlInput, UpdateUrlInput } from '../models/url.model';
import { generateId } from '../utils/id';

export class UrlCRUD {
  constructor(private db: D1Database) {}

  async create(input: CreateUrlInput): Promise<Url> {
    const now = Date.now();
    const id = generateId();
    
    // Ensure options is always a JSON string, default '{}'
    let optionsJson: string;
    if (input.options === undefined || input.options === null || input.options === '') {
      optionsJson = '{}';
    } else if (typeof input.options === 'string') {
      try {
        JSON.parse(input.options);
        optionsJson = input.options;
      } catch {
        optionsJson = '{}';
      }
    } else {
      optionsJson = JSON.stringify(input.options);
    }

    await this.db
      .prepare(
        `INSERT INTO urls (id, created_at, updated_at, user_id, domain_name, url, title, keyword, description, clicks, ip_address, active, options)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?)`
      )
      .bind(
        id,
        now,
        now,
        input.user_id,
        input.domain_name,
        input.url,
        input.title,
        input.keyword,
        input.description,
        input.ip_address || null,
        optionsJson
      )
      .run();

    return {
      id,
      created_at: now,
      updated_at: now,
      user_id: input.user_id,
      domain_name: input.domain_name,
      url: input.url,
      title: input.title,
      keyword: input.keyword,
      description: input.description,
      clicks: 0,
      ip_address: input.ip_address || null,
      active: 1,
      options: optionsJson,
    };
  }

  async findById(id: string): Promise<Url | null> {
    const result = await this.db
      .prepare('SELECT * FROM urls WHERE id = ?')
      .bind(id)
      .first<Url>();

    return result || null;
  }

  async findByUserId(userId: string, limit = 100, offset = 0): Promise<Url[]> {
    const result = await this.db
      .prepare('SELECT * FROM urls WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all<Url>();

    return (result && result.results) || [];
  }

  async update(id: string, input: UpdateUrlInput): Promise<Url | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const now = Date.now();
    const updates: string[] = [];
    const values: any[] = [];

    if (input.user_id !== undefined) {
      updates.push('user_id = ?');
      values.push(input.user_id);
    }
    if (input.domain_name !== undefined) {
      updates.push('domain_name = ?');
      values.push(input.domain_name);
    }
    if (input.url !== undefined) {
      updates.push('url = ?');
      values.push(input.url);
    }
    if (input.title !== undefined) {
      updates.push('title = ?');
      values.push(input.title);
    }
    if (input.keyword !== undefined) {
      updates.push('keyword = ?');
      values.push(input.keyword);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }
    if (input.ip_address !== undefined) {
      updates.push('ip_address = ?');
      values.push(input.ip_address);
    }
    if (input.active !== undefined) {
      updates.push('active = ?');
      values.push(input.active);
    }
    if (input.options !== undefined) {
      let optionsJson: string;
      if (input.options === null || input.options === undefined || input.options === '') {
        optionsJson = '{}';
      } else if (typeof input.options === 'string') {
        try {
          JSON.parse(input.options);
          optionsJson = input.options;
        } catch {
          optionsJson = '{}';
        }
      } else {
        optionsJson = JSON.stringify(input.options);
      }
      updates.push('options = ?');
      values.push(optionsJson);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db
      .prepare(`UPDATE urls SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM urls WHERE id = ?')
      .bind(id)
      .run();

    return result.success;
  }

  async count(): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM urls')
      .first<{ count: number }>();

    return result?.count || 0;
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM urls WHERE user_id = ?')
      .bind(userId)
      .first<{ count: number }>();

    return result?.count || 0;
  }
}
