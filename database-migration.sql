-- Миграция: добавление колонок для цен Турции и Украины

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS price_turkey INTEGER NULL,
ADD COLUMN IF NOT EXISTS price_ukraine INTEGER NULL;
