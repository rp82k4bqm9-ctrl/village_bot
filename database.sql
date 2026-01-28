-- SQL для создания таблицы игр в PostgreSQL на Beget (или другом хостинге)

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  platform JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  image VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_games_platform ON games USING GIN (platform);
CREATE INDEX IF NOT EXISTS idx_games_categories ON games USING GIN (categories);

-- Пример данных (можно удалить после теста)
INSERT INTO games (title, price, original_price, platform, categories, description) VALUES
('The Last of Us Part II', 3499, 4999, '["PS4", "PS5"]', '["popular", "exclusive"]', 'Эпическое приключение в постапокалиптическом мире'),
('God of War Ragnarök', 4499, null, '["PS4", "PS5"]', '["popular", "exclusive"]', 'Продолжение легендарной саги'),
('Spider-Man 2', 4999, null, '["PS5"]', '["popular", "exclusive"]', 'Новые приключения Человека-паука'),
('Horizon Forbidden West', 2999, 3999, '["PS4", "PS5"]', '["sale"]', 'Откройте западные земли');

-- Таблица для текстовых блоков (FAQ, О нас, поддержка и др.)
CREATE TABLE IF NOT EXISTS content_blocks (
  key VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255),
  content JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

