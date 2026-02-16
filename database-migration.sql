-- Миграция: добавление колонок для цен Турции и Индии

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS price_turkey INTEGER NULL,
ADD COLUMN IF NOT EXISTS price_india INTEGER NULL;
