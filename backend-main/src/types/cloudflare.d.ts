
// Type definitions for Cloudflare Workers or related types

// D1Database type (minimal, extend as needed)
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] } | null>;
  run<T = unknown>(): Promise<{ success: boolean; meta?: T }>;
}
