import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

// ---------- MySQL pool (Timeweb) ----------

function parseDatabaseUrl(url) {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  // mysql://user:password@host:port/database
  const match = url.match(/^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);

  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected mysql://user:password@host:port/database');
  }

  const [, user, password, host, port, database] = match;

  return {
    host,
    port: Number(port),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

let pool;

try {
  const config = parseDatabaseUrl(process.env.DATABASE_URL || '');
  pool = mysql.createPool(config);
  console.log('MySQL pool created for host', config.host);
} catch (error) {
  console.error('Failed to create MySQL pool from DATABASE_URL:', error);
  process.exit(1);
}

// ---------- Helpers ----------

function normalizeGameRow(row) {
  return {
    ...row,
    platform: row.platform ? JSON.parse(row.platform) : [],
    categories: row.categories ? JSON.parse(row.categories) : [],
    description: row.description ?? '',
    image: row.image ?? '',
  };
}

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'village-admin-2024';

// ---------- Express app ----------

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// ---------- Games API ----------

app.get('/api/games', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games ORDER BY created_at DESC');
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

    const { title, price, originalPrice, platform, categories, description, image } = req.body;

    const [result] = await pool.query(
      `INSERT INTO games (title, price, original_price, platform, categories, description, image)
       VALUES (?, ?, ?, JSON_ARRAY(), JSON_ARRAY(), ?, ?)`,
      [title, price, originalPrice || null, description || '', image || '']
    );

    const insertId = result.insertId;

    if (platform && Array.isArray(platform)) {
      await pool.query('UPDATE games SET platform = ? WHERE id = ?', [
        JSON.stringify(platform),
        insertId,
      ]);
    }

    if (categories && Array.isArray(categories)) {
      await pool.query('UPDATE games SET categories = ? WHERE id = ?', [
        JSON.stringify(categories),
        insertId,
      ]);
    }

    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [insertId]);

    if (!rows.length) {
      return res.status(500).json({ error: 'Не удалось получить созданную игру' });
    }

    res.status(201).json(normalizeGameRow(rows[0]));
  } catch (error) {
    console.error('POST /api/games error:', error);
    res.status(500).json({ error: 'Database error' });
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

    const [result] = await pool.query(
      `UPDATE games
       SET title = ?, price = ?, original_price = ?, description = ?, image = ?
       WHERE id = ?`,
      [title, price, originalPrice || null, description || '', image || '', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }

    if (platform && Array.isArray(platform)) {
      await pool.query('UPDATE games SET platform = ? WHERE id = ?', [
        JSON.stringify(platform),
        id,
      ]);
    }

    if (categories && Array.isArray(categories)) {
      await pool.query('UPDATE games SET categories = ? WHERE id = ?', [
        JSON.stringify(categories),
        id,
      ]);
    }

    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [id]);

    if (!rows.length) {
      return res.status(500).json({ error: 'Не удалось получить обновлённую игру' });
    }

    res.status(200).json(normalizeGameRow(rows[0]));
  } catch (error) {
    console.error('PUT /api/games/:id error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM games WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
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

    const [rows] = await pool.query(
      'SELECT `key`, title, content, updated_at FROM content_blocks WHERE `key` = ?',
      [key]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Контент не найден' });
    }

    const row = rows[0];

    res.status(200).json({
      key: row.key,
      title: row.title,
      content: JSON.parse(row.content),
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

    const jsonContent = JSON.stringify(content);

    await pool.query(
      `INSERT INTO content_blocks (\`key\`, title, content)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = COALESCE(VALUES(title), title),
         content = VALUES(content),
         updated_at = CURRENT_TIMESTAMP`,
      [key, title || null, jsonContent]
    );

    const [rows] = await pool.query(
      'SELECT `key`, title, content, updated_at FROM content_blocks WHERE `key` = ?',
      [key]
    );

    if (!rows.length) {
      return res.status(500).json({ error: 'Не удалось получить сохранённый контент' });
    }

    const row = rows[0];

    res.status(200).json({
      key: row.key,
      title: row.title,
      content: JSON.parse(row.content),
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

