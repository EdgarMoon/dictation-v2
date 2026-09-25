import { sql } from '@vercel/postgres';
import { ensureSchema, toClient, toConfig } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  await ensureSchema();
  const b = await req.json();
  const title = String(b.title || '').trim();
  if (!title) return Response.json({ error: 'title required' }, { status: 400 });
  const words = Array.isArray(b.words) ? b.words.filter((w) => typeof w === 'string') : [];
  const { rows } = await sql`
    UPDATE lists
    SET title = ${title}, lang = ${b.lang === 'en' ? 'en' : 'fr'},
        words = ${JSON.stringify(words)}::jsonb,
        config = ${JSON.stringify(toConfig(b))}::jsonb,
        updated_at = NOW()
    WHERE id = ${params.id}
    RETURNING id, kid, title, lang, words, config, created_at, updated_at`;
  if (!rows.length) return Response.json({ error: 'not found' }, { status: 404 });
  return Response.json(toClient(rows[0]));
}

export async function DELETE(req, { params }) {
  await ensureSchema();
  await sql`DELETE FROM lists WHERE id = ${params.id}`;
  return Response.json({ ok: true });
}
