import { Pool } from "pg";

if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

const pool = global._pgPool;

export default pool;
