import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

// ---------- Neon (PostgreSQL) ----------

// Жёстко прописанные данные подключения (без переменных окружения)
const DATABASE_URL = 'postgresql://neondb_owner:npg_DkzXPE5flt8N@ep-raspy-bush-ah8ly5zd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
console.log('Neon PostgreSQL client initialized (hardcoded)');

// ---------- Helpers ----------

// Вспомогательная функция для безопасного парсинга массивов из БД
function parseDbArray(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return field ? [field] : [];
    }
  }
  return [];
}

function normalizeGameRow(row) {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    original_price: row.original_price,
    platform: parseDbArray(row.platform),
    categories: parseDbArray(row.categories),
    description: row.description ?? '',
    image: row.image ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const ADMIN_TOKEN = 'village-admin-2024';

// ---------- Express app ----------

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// ---------- Games API ----------

app.get('/api/games', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM games ORDER BY created_at DESC`;
    const normalized = rows.map(normalizeGameRow);
    res.status(200).json(normalized);
  } catch (error) {
    console.error('GET /api/games error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { title, price, original_price, platform, categories, description, image } = req.body;

    // Преобразуем массивы в JSON для полей jsonb
    const platformJson = JSON.stringify(platform || []);
    const categoriesJson = JSON.stringify(categories || []);

    const [row] = await sql`
      INSERT INTO games (title, price, original_price, platform, categories, description, image)
      VALUES (${title}, ${price}, ${original_price || null}, ${platformJson}::jsonb, ${categoriesJson}::jsonb, ${description || ''}, ${image || ''})
      RETURNING *
    `;

    res.status(201).json(normalizeGameRow(row));
  } catch (error) {
    console.error('POST /api/games error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

app.put('/api/games/:id', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;
    const { title, price, original_price, platform, categories, description, image } = req.body;

    // Преобразуем массивы в JSON для полей jsonb
    const platformJson = JSON.stringify(platform || []);
    const categoriesJson = JSON.stringify(categories || []);

    const [row] = await sql`
      UPDATE games
      SET title = ${title},
          price = ${price},
          original_price = ${original_price || null},
          description = ${description || ''},
          image = ${image || ''},
          platform = ${platformJson}::jsonb,
          categories = ${categoriesJson}::jsonb,
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
    res.status(500).json({ error: 'Database error', details: error.message });
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
    res.status(500).json({ error: 'Database error' });
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
    res.status(500).json({ error: 'Database error' });
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
    res.status(500).json({ error: 'Database error' });
  }
});

// ---------- Start server ----------

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
