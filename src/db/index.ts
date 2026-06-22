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
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN optimal_code TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN example_input TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN example_output TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN hook_text TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN explanation_1 TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN explanation_2 TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN pro_tip TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN module_name TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN real_world_usecase TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN common_edge_cases TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN interview_question TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN brute_time TEXT;`);
    await db.exec(`ALTER TABLE posts ADD COLUMN brute_space TEXT;`);
    await db.exec(`ALTER TABLE posts ADD COLUMN optimal_time TEXT;`);
    await db.exec(`ALTER TABLE posts ADD COLUMN optimal_space TEXT;`);
  } catch (e) {}

  try {
    await db.exec(`ALTER TABLE posts ADD COLUMN questions_json TEXT;`);
  } catch (e) {}
}
