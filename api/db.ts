import { neon } from '@neondatabase/serverless';

// Vercel + Neon: DATABASE_URL должен быть postgresql://... из панели Neon
const connectionString = process.env.DATABASE_URL;
if (connectionString && connectionString.startsWith('mysql://')) {
  console.error('DATABASE_URL must be a Neon Postgres URL (postgresql://...), not MySQL. See VERCEL_NEON_SETUP.md');
}
export const sql =
  connectionString && connectionString.startsWith('postgresql')
    ? neon(connectionString)
    : null;

export default sql;
