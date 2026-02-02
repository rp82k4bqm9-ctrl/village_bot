import { neon } from '@neondatabase/serverless';

// ---------- Neon (PostgreSQL) ----------
// Приоритет: переменные окружения (для Vercel) > хардкод (для локальной разработки)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_DkzXPE5flt8N@ep-raspy-bush-ah8ly5zd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'village-admin-2024';

// Ленивое подключение к БД
let sqlInstance = null;
function getSql() {
  if (!sqlInstance) {
    sqlInstance = neon(DATABASE_URL);
  }
  return sqlInstance;
}

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

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');
}

// ---------- Body Parser ----------
async function getBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        if (data) {
          resolve(JSON.parse(data));
        } else {
          resolve({});
        }
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// ---------- Main Handler ----------
export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url.split('?')[0];

  try {
    // Health check
    if (path === '/api/health' && method === 'GET') {
      const sql = getSql();
      await sql`SELECT 1`;
      return res.status(200).json({ status: 'ok', db: 'connected' });
    }

    // GET /api/games
    if (path === '/api/games' && method === 'GET') {
      const sql = getSql();
      const rows = await sql`SELECT * FROM games ORDER BY created_at DESC`;
      return res.status(200).json(rows.map(normalizeGameRow));
    }

    // POST /api/games
    if (path === '/api/games' && method === 'POST') {
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      const sql = getSql();
      const body = await getBody(req);
      
      console.log('POST /api/games - body:', JSON.stringify(body));
      
      const { title, price, originalPrice, platform, categories, description, image } = body;
      
      // Проверка обязательных полей
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Название игры обязательно' });
      }
      if (price === undefined || price === null || isNaN(Number(price))) {
        return res.status(400).json({ error: 'Цена игры обязательна и должна быть числом' });
      }
      
      try {
        const [row] = await sql`
          INSERT INTO games (title, price, original_price, platform, categories, description, image)
          VALUES (${title.trim()}, ${Number(price)}, ${originalPrice ? Number(originalPrice) : null}, ${platform || []}, ${categories || []}, ${description || ''}, ${image || ''})
          RETURNING *
        `;
        console.log('Game created:', row);
        return res.status(201).json(normalizeGameRow(row));
      } catch (dbError) {
        console.error('Database error on INSERT:', dbError);
        return res.status(500).json({ error: 'Ошибка базы данных', message: dbError.message });
      }
    }

    // PUT /api/games/:id
    if (path.startsWith('/api/games/') && method === 'PUT') {
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      const id = path.split('/')[3];
      const sql = getSql();
      const body = await getBody(req);
      const { title, price, originalPrice, platform, categories, description, image } = body;
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
      return res.status(200).json(normalizeGameRow(row));
    }

    // DELETE /api/games/:id
    if (path.startsWith('/api/games/') && method === 'DELETE') {
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      const id = path.split('/')[3];
      const sql = getSql();
      const [row] = await sql`DELETE FROM games WHERE id = ${id} RETURNING *`;
      if (!row) {
        return res.status(404).json({ error: 'Игра не найдена' });
      }
      return res.status(200).json({ message: 'Игра удалена' });
    }

    // GET /api/content?key=...
    if (path === '/api/content' && method === 'GET') {
      const key = new URL(req.url, `http://${req.headers.host}`).searchParams.get('key');
      if (!key) {
        return res.status(400).json({ error: 'Параметр key обязателен' });
      }
      const sql = getSql();
      const [row] = await sql`SELECT "key", title, content, updated_at FROM content_blocks WHERE "key" = ${key}`;
      if (!row) {
        return res.status(404).json({ error: 'Контент не найден' });
      }
      return res.status(200).json({
        key: row.key,
        title: row.title,
        content: row.content,
        updated_at: row.updated_at,
      });
    }

    // PUT /api/content
    if (path === '/api/content' && method === 'PUT') {
      const adminToken = req.headers['x-admin-token'];
      if (adminToken !== ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      const body = await getBody(req);
      const { key, title, content } = body;
      if (!key) {
        return res.status(400).json({ error: 'Поле key обязательно' });
      }
      if (!content) {
        return res.status(400).json({ error: 'Поле content обязательно' });
      }
      const sql = getSql();
      const [row] = await sql`
        INSERT INTO content_blocks ("key", title, content)
        VALUES (${key}, ${title || null}, ${content})
        ON CONFLICT ("key") DO UPDATE
          SET title = COALESCE(EXCLUDED.title, content_blocks.title),
              content = EXCLUDED.content,
              updated_at = NOW()
        RETURNING *
      `;
      return res.status(200).json({
        key: row.key,
        title: row.title,
        content: row.content,
        updated_at: row.updated_at,
      });
    }

    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Database error', message: error.message });
  }
}
