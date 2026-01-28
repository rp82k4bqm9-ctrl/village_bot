import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from './db';

interface ContentRow extends RowDataPacket {
  key: string;
  title: string | null;
  content: string;
  updated_at: string;
}

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
      const [rows] = await pool.query<ContentRow[]>(
        'SELECT `key`, title, content, updated_at FROM content_blocks WHERE `key` = ?',
        [key]
      );

      if (!rows.length) {
        return res.status(404).json({ error: 'Контент не найден' });
      }

      const row = rows[0];

      return res.status(200).json({
        key: row.key,
        title: row.title,
        content: JSON.parse(row.content as unknown as string),
        updated_at: row.updated_at,
      });
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

      const jsonContent = JSON.stringify(content);

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO content_blocks (\`key\`, title, content)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = COALESCE(VALUES(title), title),
           content = VALUES(content),
           updated_at = CURRENT_TIMESTAMP`,
        [key, title || null, jsonContent]
      );

      if ((result as ResultSetHeader).affectedRows === 0) {
        return res.status(500).json({ error: 'Не удалось сохранить контент' });
      }

      const [rows] = await pool.query<ContentRow[]>(
        'SELECT `key`, title, content, updated_at FROM content_blocks WHERE `key` = ?',
        [key]
      );

      if (!rows.length) {
        return res.status(500).json({ error: 'Не удалось получить сохранённый контент' });
      }

      const row = rows[0];

      return res.status(200).json({
        key: row.key,
        title: row.title,
        content: JSON.parse(row.content as unknown as string),
        updated_at: row.updated_at,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Content API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

