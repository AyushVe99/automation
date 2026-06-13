import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initializeDb(dbInstance);

  return dbInstance;
}

async function initializeDb(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series TEXT NOT NULL,
      day INTEGER NOT NULL,
      title TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      code TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      caption TEXT,
      hashtags TEXT,
      published BOOLEAN DEFAULT 0,
      published_at DATETIME,
      instagram_post_id TEXT,
      UNIQUE(series, day)
    )
  `);

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN brute_force_code TEXT;`);
  } catch (e) {
    // Column might already exist
  }

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN optimal_code TEXT;`);
  } catch (e) {
    // Column might already exist
  }
}
