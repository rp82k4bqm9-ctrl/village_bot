import mysql from 'mysql2/promise';

// Подключение к MySQL на Timeweb (или другом хостинге) через DATABASE_URL
function parseDatabaseUrl(url: string) {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  // Формат: mysql://user:password@host:port/database или mysql://user:password@host/database (порт 3306)
  const match = url.match(/^mysql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/(.+)$/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL. Expected: mysql://user:password@host:3306/database');
  }
  const [, user, password, host, portStr, database] = match;
  const port = portStr ? parseInt(portStr, 10) : 3306;
  return {
    host,
    port,
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

let pool: mysql.Pool;

try {
  const config = parseDatabaseUrl(process.env.DATABASE_URL || '');
  pool = mysql.createPool(config);
} catch (error) {
  console.error('Failed to create MySQL pool:', error);
  pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: '',
    password: '',
    database: '',
  });
}

export default pool;
