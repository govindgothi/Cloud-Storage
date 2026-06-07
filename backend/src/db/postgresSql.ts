import { Pool, PoolClient, QueryResult } from "pg";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

export interface DBConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
}

/* ─────────────────────────────────────────────
   POOL
───────────────────────────────────────────── */

let pool: Pool | null = null;

export function initDB(config: DBConfig): void {
  if (pool) return;

  pool = new Pool({
    host: config.host,
    port: config.port ?? 5432,
    user: config.user,
    password: config.password,
    database: config.database,
    max: config.connectionLimit ?? 10,
  });
}

function getPool(): Pool {
  if (!pool) throw new Error("Call initDB() first");
  return pool;
}

export async function closeDB(): Promise<void> {
  await pool?.end();
  pool = null;
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

export type InsertResult = QueryResult;
export type UpdateResult = QueryResult;
export type DeleteResult = QueryResult;

/* ─────────────────────────────────────────────
   ONLY ONE FUNCTION
───────────────────────────────────────────── */

export async function query<T = any>(
  sql: string,
  params: any[] = [],
  conn?: PoolClient
): Promise<T> {
  const executor = conn ?? getPool();

  const result = await executor.query(sql, params);

  return result.rows as T;
}

/* ─────────────────────────────────────────────
   OPTIONAL TRANSACTION
───────────────────────────────────────────── */

export async function transaction<T>(
  fn: (conn: PoolClient) => Promise<T>
): Promise<T> {
  const conn = await getPool().connect();

  try {
    await conn.query("BEGIN");

    const result = await fn(conn);

    await conn.query("COMMIT");

    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    throw error;
  } finally {
    conn.release();
  }
}