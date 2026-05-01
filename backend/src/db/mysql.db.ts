import mysql, {
  Pool,
  PoolConnection,
  ResultSetHeader,
} from "mysql2/promise";

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

  pool = mysql.createPool({
    host: config.host,
    port: config.port ?? 3306,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: config.connectionLimit ?? 10,
    waitForConnections: true,
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

export type InsertResult = ResultSetHeader;
export type UpdateResult = ResultSetHeader;
export type DeleteResult = ResultSetHeader;

/* ─────────────────────────────────────────────
   ONLY ONE FUNCTION
───────────────────────────────────────────── */

export async function query<T = any>(
  sql: string,
  params: any[] = [],
  conn?: PoolConnection
): Promise<T> {
  const executor = conn ?? getPool();

  const [rows] = await executor.execute(sql, params);

  return rows as T;
}

/* ─────────────────────────────────────────────
   OPTIONAL TRANSACTION
───────────────────────────────────────────── */

export async function transaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPool().getConnection();

  try {
    await conn.beginTransaction();

    const result = await fn(conn);

    await conn.commit();

    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}