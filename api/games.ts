import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

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
      const result = await pool.query('SELECT * FROM games ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      // Добавить новую игру (только для админа)
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      const { title, price, originalPrice, platform, categories, description, image } = req.body;
      
      const result = await pool.query(
        `INSERT INTO games (title, price, original_price, platform, categories, description, image) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [title, price, originalPrice || null, JSON.stringify(platform), JSON.stringify(categories), description || '', image || '']
      );
      
      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
