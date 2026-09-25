import { sql } from '@vercel/postgres';

const KIDS = ['soyoon', 'doyoon', 'siyoon'];

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS lists (
      id SERIAL PRIMARY KEY,
      kid TEXT NOT NULL,
      title TEXT NOT NULL,
      lang TEXT NOT NULL DEFAULT 'fr',
      words JSONB NOT NULL DEFAULT '[]',
      config JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_lists_kid ON lists(kid)`;
}

export function validKid(k) {
  return KIDS.includes(k) ? k : 'soyoon';
}

export function toClient(r) {
  const cfg = r.config || {};
  return {
    id: String(r.id),
    kid: r.kid,
    name: r.title,
    lang: r.lang,
    words: r.words || [],
    repeats: cfg.repeats,
    rate: cfg.rate,
    gap: cfg.gap,
    order: cfg.order,
    mode: cfg.mode,
    autonext: cfg.autonext,
    autonextDelay: cfg.autonextDelay,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function toConfig(b) {
  return {
    repeats: b.repeats,
    rate: b.rate,
    gap: b.gap,
    order: b.order,
    mode: b.mode,
    autonext: !!b.autonext,
    autonextDelay: b.autonextDelay,
  };
}
