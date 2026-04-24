import { Database } from "bun:sqlite";
import { dirname } from "path";
import { mkdirSync } from "fs";

const dbPath = process.env.DB_PATH || "tiku.db";
const dir = dirname(dbPath);
if (dir !== ".") {
  mkdirSync(dir, { recursive: true });
}

// Connect to SQLite DB
const db = new Database(dbPath, { create: true });

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    message TEXT,
    payload TEXT
  );
`);

export { db };
