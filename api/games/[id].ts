import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db';

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
      
      const result = await pool.query(
        `UPDATE games 
         SET title = $1, price = $2, original_price = $3, platform = $4, 
             categories = $5, description = $6, image = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 
         RETURNING *`,
        [title, price, originalPrice || null, JSON.stringify(platform), JSON.stringify(categories), description || '', image || '', id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Игра не найдена' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      // Удалить игру
      const result = await pool.query('DELETE FROM games WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
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
