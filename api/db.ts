import { neon } from '@neondatabase/serverless';

// Vercel + Neon: одна БД, без точек доступа и whitelist IP
const connectionString = process.env.DATABASE_URL;
export const sql = connectionString ? neon(connectionString) : null;

export default sql;
