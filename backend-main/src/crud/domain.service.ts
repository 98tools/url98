import type { D1Database } from '../types/cloudflare';
import type { Domain, CreateDomainInput, UpdateDomainInput } from '../models/domain.model';
import { generateId } from '../utils/id';

export class DomainCRUD {
  constructor(private db: D1Database) {}

  async create(input: CreateDomainInput): Promise<Domain> {
    const now = Date.now();
    const id = generateId();
    
    await this.db
      .prepare(
        'INSERT INTO domains (id, domain_name, created_at, updated_at) VALUES (?, ?, ?, ?)'
      )
      .bind(id, input.domain_name, now, now)
      .run();

    return {
      id,
      domain_name: input.domain_name,
      created_at: now,
      updated_at: now,
    };
  }

  async findById(id: string): Promise<Domain | null> {
    const result = await this.db
      .prepare('SELECT * FROM domains WHERE id = ?')
      .bind(id)
      .first<Domain>();

    return result || null;
  }

  async findByDomainName(domainName: string): Promise<Domain | null> {
    const result = await this.db
      .prepare('SELECT * FROM domains WHERE domain_name = ?')
      .bind(domainName)
      .first<Domain>();

    return result || null;
  }

  async findAll(limit = 100, offset = 0): Promise<Domain[]> {
    const result = await this.db
      .prepare('SELECT * FROM domains ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(limit, offset)
      .all<Domain>();

    return result.results || [];
  }

  async update(id: string, input: UpdateDomainInput): Promise<Domain | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const now = Date.now();
    const updates: string[] = [];
    const values: any[] = [];

    if (input.domain_name !== undefined) {
      updates.push('domain_name = ?');
      values.push(input.domain_name);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await this.db
      .prepare(`UPDATE domains SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM domains WHERE id = ?')
      .bind(id)
      .run();

    return result.success;
  }

  async count(): Promise<number> {
    const result = await this.db
      .prepare('SELECT COUNT(*) as count FROM domains')
      .first<{ count: number }>();

    return result?.count || 0;
  }
}
