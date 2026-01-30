import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!sql) return res.status(503).json({ error: 'Database not configured' });

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM games ORDER BY created_at DESC`;
      return res.status(200).json((rows as GameRow[]).map(normalizeGameRow));
    }

    if (req.method === 'POST') {
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      const { title, price, originalPrice, platform, categories, description, image } = req.body || {};

      const inserted = await sql`
        INSERT INTO games (title, price, original_price, platform, categories, description, image)
        VALUES (
          ${title ?? ''},
          ${Number(price) ?? 0},
          ${originalPrice != null ? Number(originalPrice) : null},
          ${platform && Array.isArray(platform) ? JSON.stringify(platform) : '[]'},
          ${categories && Array.isArray(categories) ? JSON.stringify(categories) : '[]'},
          ${description ?? ''},
          ${image ?? ''}
        )
        RETURNING *
      `;
      const row = (inserted as GameRow[])[0];
      if (!row) return res.status(500).json({ error: 'Не удалось получить созданную игру' });
      return res.status(201).json(normalizeGameRow(row));
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
