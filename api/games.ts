import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from './db';

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
    platform: row.platform
      ? JSON.parse(row.platform as unknown as string)
      : [],
    categories: row.categories
      ? JSON.parse(row.categories as unknown as string)
      : [],
    description: row.description ?? '',
    image: row.image ?? '',
  };
}

// Получить все игры или добавить новую
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Получить все игры
      const [rows] = await pool.query<GameRow[]>(
        'SELECT * FROM games ORDER BY created_at DESC'
      );
      const normalized = rows.map(normalizeGameRow);
      return res.status(200).json(normalized);
    }

    if (req.method === 'POST') {
      // Добавить новую игру (только для админа)
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      const { title, price, originalPrice, platform, categories, description, image } = req.body;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO games (title, price, original_price, platform, categories, description, image) 
         VALUES (?, ?, ?, JSON_ARRAY(), JSON_ARRAY(), ?, ?)`,
        [title, price, originalPrice || null, description || '', image || '']
      );

      const insertId = (result as ResultSetHeader).insertId;

      // Обновляем JSON-поля отдельно, если переданы
      if (platform && Array.isArray(platform)) {
        await pool.query(
          'UPDATE games SET platform = ? WHERE id = ?',
          [JSON.stringify(platform), insertId]
        );
      }

      if (categories && Array.isArray(categories)) {
        await pool.query(
          'UPDATE games SET categories = ? WHERE id = ?',
          [JSON.stringify(categories), insertId]
        );
      }

      const [rows] = await pool.query<GameRow[]>(
        'SELECT * FROM games WHERE id = ?',
        [insertId]
      );

      if (!rows.length) {
        return res.status(500).json({ error: 'Не удалось получить созданную игру' });
      }

      return res.status(201).json(normalizeGameRow(rows[0]));
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Database error:', error);
    const errorMessage = error?.message || 'Database error';
    const statusCode = error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' ? 503 : 500;
    return res.status(statusCode).json({ 
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
