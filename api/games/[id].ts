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

// Обновить или удалить игру
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  
  // Проверка админа
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }

  try {
    if (req.method === 'PUT') {
      // Обновить игру
      const { title, price, originalPrice, platform, categories, description, image } = req.body;

      const [result] = await pool.query<ResultSetHeader>(
        `UPDATE games 
         SET title = ?, price = ?, original_price = ?, description = ?, image = ?
         WHERE id = ?`,
        [title, price, originalPrice || null, description || '', image || '', id]
      );

      if ((result as ResultSetHeader).affectedRows === 0) {
        return res.status(404).json({ error: 'Игра не найдена' });
      }

      // Обновляем JSON-поля отдельно
      if (platform && Array.isArray(platform)) {
        await pool.query(
          'UPDATE games SET platform = ? WHERE id = ?',
          [JSON.stringify(platform), id]
        );
      }

      if (categories && Array.isArray(categories)) {
        await pool.query(
          'UPDATE games SET categories = ? WHERE id = ?',
          [JSON.stringify(categories), id]
        );
      }

      const [rows] = await pool.query<GameRow[]>(
        'SELECT * FROM games WHERE id = ?',
        [id]
      );

      if (!rows.length) {
        return res.status(500).json({ error: 'Не удалось получить обновлённую игру' });
      }

      return res.status(200).json(normalizeGameRow(rows[0]));
    }

    if (req.method === 'DELETE') {
      // Удалить игру
      const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM games WHERE id = ?',
        [id]
      );

      if ((result as ResultSetHeader).affectedRows === 0) {
        return res.status(404).json({ error: 'Игра не найдена' });
      }

      return res.status(200).json({ message: 'Игра удалена' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
