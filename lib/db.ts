import { neon } from "@neondatabase/serverless";

// Lazy-initialize: avoids throwing at build time when DATABASE_URL is absent.
// Call getSql() inside async functions, never at module load time.
let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function ensureSculpturesTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS sculptures (
      id SERIAL PRIMARY KEY,
      nickname VARCHAR(100) NOT NULL,
      geometry_data JSONB NOT NULL,
      material VARCHAR(50) NOT NULL DEFAULT 'clay',
      preview_image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
