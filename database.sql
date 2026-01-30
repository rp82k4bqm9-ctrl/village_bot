-- SQL для создания таблицы игр в MySQL (Timeweb или другой хостинг)

CREATE TABLE IF NOT EXISTS games (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  original_price INT NULL,
  platform JSON NOT NULL DEFAULT (JSON_ARRAY()),
  categories JSON NOT NULL DEFAULT (JSON_ARRAY()),
  description TEXT NOT NULL DEFAULT '',
  image VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Индексы для быстрого поиска
CREATE INDEX idx_games_platform ON games ((CAST(JSON_EXTRACT(platform, '$') AS CHAR(255))));
CREATE INDEX idx_games_categories ON games ((CAST(JSON_EXTRACT(categories, '$') AS CHAR(255))));

-- Пример данных (можно удалить после теста)
INSERT INTO games (title, price, original_price, platform, categories, description) VALUES
('The Last of Us Part II', 3499, 4999, JSON_ARRAY('PS4', 'PS5'), JSON_ARRAY('popular', 'exclusive'), 'Эпическое приключение в постапокалиптическом мире'),
('God of War Ragnarök', 4499, NULL, JSON_ARRAY('PS4', 'PS5'), JSON_ARRAY('popular', 'exclusive'), 'Продолжение легендарной саги'),
('Spider-Man 2', 4999, NULL, JSON_ARRAY('PS5'), JSON_ARRAY('popular', 'exclusive'), 'Новые приключения Человека-паука'),
('Horizon Forbidden West', 2999, 3999, JSON_ARRAY('PS4', 'PS5'), JSON_ARRAY('sale'), 'Откройте западные земли');

-- Таблица для текстовых блоков (FAQ, О нас, поддержка и др.)
CREATE TABLE IF NOT EXISTS content_blocks (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NULL,
  content JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

