import { createPool, Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export function getMysqlPool(): Pool | null {
  if (pool) return pool;

  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) return null;

  pool = createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
  });

  return pool;
}

export async function query<T = any>(sql: string, params?: any[]) {
  const p = getMysqlPool();
  if (!p) throw new Error('MySQL not configured');
  const [rows] = await p.query(sql, params);
  return rows as T;
}
