import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
// Используем .js расширение для ESM импортов
import pool from '../db.js';

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

// Получить список игр или создать новую
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { platform, category, search } = req.query;
      
      let query = 'SELECT * FROM games WHERE 1=1';
      const params: any[] = [];

      if (platform && typeof platform === 'string') {
        query += ' AND JSON_CONTAINS(platform, ?)';
        params.push(JSON.stringify([platform]));
      }

      if (category && typeof category === 'string') {
        query += ' AND JSON_CONTAINS(categories, ?)';
        params.push(JSON.stringify([category]));
      }

      if (search && typeof search === 'string') {
        query += ' AND title LIKE ?';
        params.push(`%${search}%`);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await pool.query<GameRow[]>(query, params);
      
      return res.status(200).json(rows.map(normalizeGameRow));
    }

    if (req.method === 'POST') {
      // Проверка админа
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      const { title, price, originalPrice, platform, categories, description, image } = req.body;

      if (!title || typeof price !== 'number') {
        return res.status(400).json({ error: 'Необходимы поля title и price' });
      }

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO games (title, price, original_price, platform, categories, description, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          price,
          originalPrice || null,
          platform ? JSON.stringify(platform) : '[]',
          categories ? JSON.stringify(categories) : '[]',
          description || '',
          image || ''
        ]
      );

      const [rows] = await pool.query<GameRow[]>(
        'SELECT * FROM games WHERE id = ?',
        [result.insertId]
      );

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