-- Схема для Neon (Postgres). Выполни в Neon Console → SQL Editor.

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER NULL,
  price_turkey INTEGER NULL,
  price_ukraine INTEGER NULL,
  platform JSONB NOT NULL DEFAULT '[]',
  categories JSONB NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  image VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_blocks (
  "key" VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
