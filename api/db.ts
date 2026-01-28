import mysql from 'mysql2/promise';

// Настройка подключения к MySQL (Beget или другой хостинг)
const pool = mysql.createPool(process.env.DATABASE_URL || '');

export default pool;
