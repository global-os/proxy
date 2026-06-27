import { randomUUID } from 'node:crypto'

/** DNS-safe, globally unique public instance identifier (subdomain label). */
export function generateInstanceSlug(): string {
  return randomUUID()
}

const SLUG_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidInstanceSlug(slug: string): boolean {
  return SLUG_RE.test(slug)
}