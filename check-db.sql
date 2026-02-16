-- Проверить структуру таблицы games
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'games' 
ORDER BY ordinal_position;

-- Проверить последнюю созданную игру
SELECT id, title, price, price_turkey, price_india 
FROM games 
ORDER BY id DESC 
LIMIT 1;
