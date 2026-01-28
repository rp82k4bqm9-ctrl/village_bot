import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
// ОБРАТИТЕ ВНИМАНИЕ: используем .js расширение!
import pool from './db.js';

interface ContentRow extends RowDataPacket {
  key: string;
  title: string | null;
  content: string;
  updated_at: string;
}

// Получить или обновить текстовые блоки (FAQ, О нас, Поддержка)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Проверка админа для модификации
  const adminToken = req.headers['x-admin-token'];
  const isAdmin = adminToken === process.env.ADMIN_TOKEN;

  try {
    if (req.method === 'GET') {
      const { key } = req.query;
      
      if (key && typeof key === 'string') {
        // Получить конкретный блок
        const [rows] = await pool.query<ContentRow[]>(
          'SELECT * FROM content_blocks WHERE `key` = ?',
          [key]
        );

        if (!rows.length) {
          return res.status(404).json({ error: 'Контент не найден' });
        }

        return res.status(200).json({
          ...rows[0],
          content: JSON.parse(rows[0].content)
        });
      } else {
        // Получить все блоки
        const [rows] = await pool.query<ContentRow[]>(
          'SELECT * FROM content_blocks ORDER BY `key`'
        );

        const content = rows.reduce((acc, row) => {
          acc[row.key] = {
            title: row.title,
            content: JSON.parse(row.content),
            updated_at: row.updated_at
          };
          return acc;
        }, {} as Record<string, any>);

        return res.status(200).json(content);
      }
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      if (!isAdmin) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      const { key, title, content } = req.body;

      if (!key || !content) {
        return res.status(400).json({ error: 'Необходимы поля key и content' });
      }

      const contentJson = JSON.stringify(content);

      // INSERT ... ON DUPLICATE KEY UPDATE для MySQL
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO content_blocks (\`key\`, title, content) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         title = VALUES(title), 
         content = VALUES(content)`,
        [key, title || null, contentJson]
      );

      return res.status(200).json({ 
        message: 'Контент сохранен',
        key,
        affectedRows: result.affectedRows
      });
    }

    if (req.method === 'DELETE') {
      if (!isAdmin) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      const { key } = req.query;
      
      if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'Необходим параметр key' });
      }

      const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM content_blocks WHERE `key` = ?',
        [key]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Контент не найден' });
      }

      return res.status(200).json({ message: 'Контент удален' });
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