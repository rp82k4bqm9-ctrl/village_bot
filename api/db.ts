import mysql from 'mysql2/promise';

// Парсинг строки подключения MySQL
function parseDatabaseUrl(url: string) {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  // Формат: mysql://user:password@host:port/database
  const match = url.match(/^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
  
  if (!match) {
    throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
  }

  const [, user, password, host, port, database] = match;

  return {
    host,
    port: parseInt(port, 10),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

// Настройка подключения к MySQL (Beget или другой хостинг)
let pool: mysql.Pool;

try {
  const config = parseDatabaseUrl(process.env.DATABASE_URL || '');
  pool = mysql.createPool(config);
} catch (error) {
  console.error('Failed to create MySQL pool:', error);
  // Создаём пул с пустой конфигурацией, чтобы не ломать билд
  pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: '',
    password: '',
    database: '',
  });
}

export default pool;
