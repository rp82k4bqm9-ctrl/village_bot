import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../db';

interface GameRow {
  id: number;
  title: string;
  price: number;
  original_price: number | null;
  platform: unknown;
  categories: unknown;
  description: string | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
}

function normalizeGameRow(row: GameRow) {
  return {
    ...row,
    id: String(row.id),
    platform: Array.isArray(row.platform) ? row.platform : (typeof row.platform === 'string' ? JSON.parse(row.platform) : []),
    categories: Array.isArray(row.categories) ? row.categories : (typeof row.categories === 'string' ? JSON.parse(row.categories) : []),
    description: row.description ?? '',
    image: row.image ?? '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) return res.status(403).json({ error: 'Доступ запрещен' });
  if (!sql) return res.status(503).json({ error: 'Database not configured' });

  const { id } = req.query;
  const gameId = Number(id);
  if (!id || Array.isArray(id) || !Number.isInteger(gameId)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    if (req.method === 'PUT') {
      const { title, price, originalPrice, platform, categories, description, image } = req.body || {};
      const platformJson = platform && Array.isArray(platform) ? JSON.stringify(platform) : '[]';
      const categoriesJson = categories && Array.isArray(categories) ? JSON.stringify(categories) : '[]';

      await sql`
        UPDATE games SET
          title = ${title ?? ''},
          price = ${price != null ? Number(price) : 0},
          original_price = ${originalPrice != null ? Number(originalPrice) : null},
          description = ${description ?? ''},
          image = ${image ?? ''},
          platform = ${platformJson}::jsonb,
          categories = ${categoriesJson}::jsonb,
          updated_at = NOW()
        WHERE id = ${gameId}
      `;
      const rows = await sql`SELECT * FROM games WHERE id = ${gameId}`;
      const row = (rows as GameRow[])[0];
      if (!row) return res.status(404).json({ error: 'Игра не найдена' });
      return res.status(200).json(normalizeGameRow(row));
    }

    if (req.method === 'DELETE') {
      const deleted = await sql`DELETE FROM games WHERE id = ${gameId} RETURNING id`;
      if (!deleted?.length) return res.status(404).json({ error: 'Игра не найдена' });
      return res.status(200).json({ message: 'Игра удалена' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('Database error:', error);
    return res.status(500).json({
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
    });
  }
}
