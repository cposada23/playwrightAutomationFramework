import { Pool, QueryResult } from "pg";
import { loadRuntimeConfig } from "@/utils/env";

let pool: Pool | null = null;

export function getPostgresPool(env: string): Pool {
  if (!pool) {
    const cfg = loadRuntimeConfig(env);
    pool = new Pool({ connectionString: cfg.postgres.connectionString });
  }
  return pool;
}

export async function runQuery<T = any>(env: string, sql: string, params?: any[]): Promise<QueryResult<T>> {
  const p = getPostgresPool(env);
  return p.query<T>(sql, params);
}

export async function closePool() {
  if (pool) await pool.end();
  pool = null;
}
