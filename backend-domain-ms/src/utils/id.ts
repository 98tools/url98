/**
 * Generate a UUID v4 using the Web Crypto API
 * This is available in Cloudflare Workers runtime
 */
export function generateId(): string {
  // @ts-ignore - crypto is available in Cloudflare Workers
  return crypto.randomUUID();
}
