-- Схема для Neon (Postgres). Выполни в Neon Console → SQL Editor.

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER NULL,
  price_turkey INTEGER NULL,
  price_india INTEGER NULL,
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

-- Миграция: переименовать price_ukraine → price_india (если колонка Ukraine ещё есть)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'price_ukraine')
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'price_india')
  THEN
    ALTER TABLE games RENAME COLUMN price_ukraine TO price_india;
  END IF;
END $$;

-- Миграция: добавить колонки цен для региона (если их ещё нет)
ALTER TABLE games ADD COLUMN IF NOT EXISTS price_turkey INTEGER NULL;
ALTER TABLE games ADD COLUMN IF NOT EXISTS price_india INTEGER NULL;
