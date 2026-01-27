import { Pool } from 'pg';

// Настройка подключения к PostgreSQL (Timeweb Cloud)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Требуется для Timeweb Cloud
  }
});

export default pool;
