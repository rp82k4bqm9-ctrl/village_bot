import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = (req.method === 'GET' ? req.query.key : req.body?.key) as string | undefined;
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Параметр key обязателен' });
  }
  if (!sql) return res.status(503).json({ error: 'Database not configured' });

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT "key", title, content, updated_at FROM content_blocks WHERE "key" = ${key}`;
      const row = (rows as { key: string; title: string | null; content: unknown; updated_at: Date }[])[0];
      if (!row) return res.status(404).json({ error: 'Контент не найден' });
      const content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      return res.status(200).json({ key: row.key, title: row.title, content, updated_at: row.updated_at });
    }

    if (req.method === 'PUT') {
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== process.env.ADMIN_TOKEN) return res.status(403).json({ error: 'Доступ запрещен' });
      const { title, content } = req.body || {};
      if (content === undefined) return res.status(400).json({ error: 'Поле content обязательно' });
      const jsonContent = JSON.stringify(content);

      await sql`
        INSERT INTO content_blocks ("key", title, content)
        VALUES (${key}, ${title ?? null}, ${jsonContent}::jsonb)
        ON CONFLICT ("key") DO UPDATE SET
          title = COALESCE(EXCLUDED.title, content_blocks.title),
          content = EXCLUDED.content,
          updated_at = NOW()
      `;
      const rows = await sql`SELECT "key", title, content, updated_at FROM content_blocks WHERE "key" = ${key}`;
      const row = (rows as { key: string; title: string | null; content: unknown; updated_at: Date }[])[0];
      if (!row) return res.status(500).json({ error: 'Не удалось получить сохранённый контент' });
      const parsed = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      return res.status(200).json({ key: row.key, title: row.title, content: parsed, updated_at: row.updated_at });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('Content API error:', error);
    return res.status(500).json({
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
    });
  }
}
