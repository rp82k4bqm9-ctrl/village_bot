import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../db';

interface GameRow extends RowDataPacket {
  id: number;
  title: string;
  price: number;
  original_price: number | null;
  platform: string | null;
  categories: string | null;
  description: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

function normalizeGameRow(row: GameRow) {
  return {
    ...row,
    id: String(row.id),
    platform: row.platform ? JSON.parse(row.platform as unknown as string) : [],
    categories: row.categories ? JSON.parse(row.categories as unknown as string) : [],
    description: row.description ?? '',
    image: row.image ?? '',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  try {
    if (req.method === 'PUT') {
      const { title, price, originalPrice, platform, categories, description, image } = req.body || {};

      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE games SET title = ?, price = ?, original_price = ?, description = ?, image = ? WHERE id = ?`,
        [title ?? '', price ?? 0, originalPrice != null ? originalPrice : null, description ?? '', image ?? '', id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Игра не найдена' });
      }

      if (platform && Array.isArray(platform)) {
        await pool.query('UPDATE games SET platform = ? WHERE id = ?', [JSON.stringify(platform), id]);
      }
      if (categories && Array.isArray(categories)) {
        await pool.query('UPDATE games SET categories = ? WHERE id = ?', [JSON.stringify(categories), id]);
      }

      const [rows] = await pool.query<GameRow[]>('SELECT * FROM games WHERE id = ?', [id]);
      if (!rows.length) {
        return res.status(500).json({ error: 'Не удалось получить обновлённую игру' });
      }
      return res.status(200).json(normalizeGameRow(rows[0]));
    }

    if (req.method === 'DELETE') {
      const [result] = await pool.query<ResultSetHeader>('DELETE FROM games WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Игра не найдена' });
      }
      return res.status(200).json({ message: 'Игра удалена' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: unknown) {
    console.error('Database error:', error);
    const message = error instanceof Error ? error.message : 'Database error';
    return res.status(500).json({
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
}
