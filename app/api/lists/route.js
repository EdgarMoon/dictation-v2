import { sql } from '@vercel/postgres';
import { ensureSchema, validKid, toClient, toConfig } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await ensureSchema();
  const { searchParams } = new URL(req.url);
  const kidParam = searchParams.get('kid');
  if (kidParam === 'all') {
    const { rows } = await sql`
      SELECT id, kid, title, lang, words, config, created_at, updated_at
      FROM lists ORDER BY updated_at DESC`;
    return Response.json(rows.map(toClient));
  }
  const kid = validKid(kidParam);
  const { rows } = await sql`
    SELECT id, kid, title, lang, words, config, created_at, updated_at
    FROM lists WHERE kid = ${kid} ORDER BY updated_at DESC`;
  return Response.json(rows.map(toClient));
}

export async function POST(req) {
  await ensureSchema();
  const b = await req.json();
  const kid = validKid(b.kid);
  const title = String(b.title || '').trim();
  if (!title) return Response.json({ error: 'title required' }, { status: 400 });
  const words = Array.isArray(b.words) ? b.words.filter((w) => typeof w === 'string') : [];
  const { rows } = await sql`
    INSERT INTO lists (kid, title, lang, words, config)
    VALUES (${kid}, ${title}, ${b.lang === 'en' ? 'en' : 'fr'},
      ${JSON.stringify(words)}::jsonb, ${JSON.stringify(toConfig(b))}::jsonb)
    RETURNING id, kid, title, lang, words, config, created_at, updated_at`;
  return Response.json(toClient(rows[0]), { status: 201 });
}
