import { Database } from "bun:sqlite";

// Connect to SQLite DB in the server root
const db = new Database("tiku.db", { create: true });

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
