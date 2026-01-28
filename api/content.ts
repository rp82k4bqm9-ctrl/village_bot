import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from './db';

// Управление текстовыми блоками (FAQ, О нас и т.д.)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const key = (req.method === 'GET' ? req.query.key : req.body?.key) as string | undefined;

    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Параметр key обязателен' });
    }

    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT key, title, content, updated_at FROM content_blocks WHERE key = $1',
        [key]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Контент не найден' });
      }

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      const { title, content } = req.body || {};

      if (!content) {
        return res.status(400).json({ error: 'Поле content обязательно' });
      }

      const result = await pool.query(
        `INSERT INTO content_blocks (key, title, content)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE
         SET title = COALESCE($2, content_blocks.title),
             content = $3,
             updated_at = CURRENT_TIMESTAMP
         RETURNING key, title, content, updated_at`,
        [key, title || null, JSON.stringify(content)]
      );

      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Content API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

