import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

// ---------- Neon (PostgreSQL) ----------

// Формируем URL из частей чтобы избежать проблем с экранированием
const DB_PROTOCOL = 'postgresql';
const DB_USER = 'neondb_owner';
const DB_PASS = 'npg_xzqHp87LMPAtep';
const DB_HOST = 'blue-moon-abhzsn8s-pooler.eu-west-2.aws.neon.tech';
const DB_NAME = 'neondb';
const DB_PARAMS = 'sslmode=require&channel_binding=require';

const FALLBACK_URL = `${DB_PROTOCOL}://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?${DB_PARAMS}`;

let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.log('DATABASE_URL not set, using fallback');
  DATABASE_URL = FALLBACK_URL;
}

const sql = neon(DATABASE_URL);

// ---------- Helpers ----------

function normalizeGameRow(row) {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    original_price: row.original_price,
    platform: row.platform || [],
    categories: row.categories || [],
    description: row.description ?? '',
    image: row.image ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'village-admin-2024';

// ---------- Express app ----------

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// ---------- Games API ----------

app.get('/api/games', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM games ORDER BY created_at DESC`;
    const normalized = rows.map(normalizeGameRow);
    res.status(200).json(normalized);
  } catch (error) {
    console.error('GET /api/games error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { title, price, originalPrice, platform, categories, description, image } = req.body;

    const [row] = await sql`
      INSERT INTO games (title, price, original_price, platform, categories, description, image)
      VALUES (${title}, ${price}, ${originalPrice || null}, ${platform || []}, ${categories || []}, ${description || ''}, ${image || ''})
      RETURNING *
    `;

    res.status(201).json(normalizeGameRow(row));
  } catch (error) {
    console.error('POST /api/games error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

app.put('/api/games/:id', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { title, price, originalPrice, platform, categories, description, image } = req.body;

    const [row] = await sql`
      UPDATE games
      SET title = ${title},
          price = ${price},
          original_price = ${originalPrice || null},
          description = ${description || ''},
          image = ${image || ''},
          platform = ${platform || []},
          categories = ${categories || []},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!row) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    res.status(200).json(normalizeGameRow(row));
  } catch (error) {
    console.error('PUT /api/games/:id error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    const [row] = await sql`DELETE FROM games WHERE id = ${id} RETURNING *`;

    if (!row) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    res.status(200).json({ message: 'Игра удалена' });
  } catch (error) {
    console.error('DELETE /api/games/:id error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// ---------- Content API ----------

app.get('/api/content', async (req, res) => {
  try {
    const key = req.query.key;

    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'Параметр key обязателен' });
    }

    const [row] = await sql`SELECT "key", title, content, updated_at FROM content_blocks WHERE "key" = ${key}`;

    if (!row) {
      return res.status(404).json({ error: 'Контент не найден' });
    }

    res.status(200).json({
      key: row.key,
      title: row.title,
      content: row.content,
      updated_at: row.updated_at,
    });
  } catch (error) {
    console.error('GET /api/content error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

app.put('/api/content', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { key, title, content } = req.body || {};

    if (!key) {
      return res.status(400).json({ error: 'Поле key обязательно' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Поле content обязательно' });
    }

    const [row] = await sql`
      INSERT INTO content_blocks ("key", title, content)
      VALUES (${key}, ${title || null}, ${content})
      ON CONFLICT ("key") DO UPDATE
        SET title = COALESCE(EXCLUDED.title, content_blocks.title),
            content = EXCLUDED.content,
            updated_at = NOW()
      RETURNING *
    `;

    if (!row) {
      return res.status(500).json({ error: 'Не удалось получить сохранённый контент' });
    }

    res.status(200).json({
      key: row.key,
      title: row.title,
      content: row.content,
      updated_at: row.updated_at,
    });
  } catch (error) {
    console.error('PUT /api/content error:', error);
    res.status(500).json({ error: 'Database error', message: error.message });
  }
});

// Export for Vercel serverless
export default app;
