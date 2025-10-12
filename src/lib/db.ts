import DatabaseConstructor, { type Database as DatabaseInstance } from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { hashSync } from "bcryptjs";

export type Role = "user" | "admin";

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  role: Role;
};

const DEFAULT_USERS: Array<{ username: string; password: string; role: Role }> = [
  { username: "user", password: "user123", role: "user" },
  { username: "admin", password: "admin123", role: "admin" },
];

const DATABASE_PATH = process.env.FOCUSFLOW_DB_PATH ??
  path.join(process.cwd(), "data", "focusflow.db");

let singleton: DatabaseInstance | null = null;

function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function runMigrations(db: DatabaseInstance) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'admin'))
    );
  `);
}

function seedDefaultUsers(db: DatabaseInstance) {
  const insert = db.prepare(
    `INSERT INTO users (username, password_hash, role)
     VALUES (@username, @password_hash, @role)
     ON CONFLICT(username) DO NOTHING;`
  );

  db.transaction(() => {
    for (const { username, password, role } of DEFAULT_USERS) {
      insert.run({
        username,
        password_hash: hashSync(password, 10),
        role,
      });
    }
  })();
}

function initialize(): DatabaseInstance {
  if (singleton) {
    return singleton;
  }

  ensureDirectoryExists(DATABASE_PATH);
  const db = new DatabaseConstructor(DATABASE_PATH);
  db.pragma("journal_mode = WAL");
  runMigrations(db);
  seedDefaultUsers(db);
  singleton = db;
  return db;
}

export function getDb() {
  return initialize();
}

export function getUserByUsername(username: string): UserRow | null {
  const db = getDb();
  const stmt = db.prepare(
    `SELECT id, username, password_hash, role
     FROM users WHERE lower(username) = lower(?)`
  );
  const row = stmt.get(username) as UserRow | undefined;
  return row ?? null;
}
