import { Pool } from 'pg';

// Настройка подключения к PostgreSQL (Beget или другой хостинг)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
