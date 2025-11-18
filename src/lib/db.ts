import DatabaseConstructor, { type Database as DatabaseInstance } from "better-sqlite3";
import { hashSync } from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { MongoClient, type Collection, ObjectId } from "mongodb";

export type Role = "user" | "admin";

type UserRecord = {
  id: number;
  username: string;
  password_hash: string;
  role: Role;
};

type MongoUserDocument = UserRecord & {
  _id?: ObjectId;
  usernameLower: string;
};

const DEFAULT_USERS: Array<{ username: string; password: string; role: Role }> = [
  { username: "user", password: "user123", role: "user" },
  { username: "admin", password: "admin123", role: "admin" },
];

const providerRaw = (process.env.FOCUSFLOW_DB_PROVIDER ?? "sql").toLowerCase();
const provider = ["mongo", "mongodb"].includes(providerRaw) ? "mongo" : "sql";
const useMongo = provider === "mongo";

const DATABASE_PATH =
  process.env.FOCUSFLOW_DB_PATH ?? path.join(process.cwd(), "data", "focusflow.db");

const MONGO_URI = process.env.FOCUSFLOW_MONGO_URI ?? "mongodb://localhost:27017/focusflow";
const MONGO_DB_NAME = getMongoDatabaseName(MONGO_URI);

let sqliteSingleton: DatabaseInstance | null = null;
let mongoCollectionPromise: Promise<Collection<MongoUserDocument>> | null = null;

function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function runSqliteMigrations(db: DatabaseInstance) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'admin'))
    );
  `);
}

function seedSqliteDefaultUsers(db: DatabaseInstance) {
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

function initializeSqlite(): DatabaseInstance {
  if (sqliteSingleton) {
    return sqliteSingleton;
  }

  ensureDirectoryExists(DATABASE_PATH);
  const db = new DatabaseConstructor(DATABASE_PATH);
  db.pragma("journal_mode = WAL");
  runSqliteMigrations(db);
  seedSqliteDefaultUsers(db);
  sqliteSingleton = db;
  return db;
}

function getMongoDatabaseName(uri: string) {
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname.replace(/^\//, "");
    return pathname || "focusflow";
  } catch {
    return "focusflow";
  }
}

async function getMongoCollection() {
  if (!mongoCollectionPromise) {
    mongoCollectionPromise = (async () => {
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      const db = client.db(MONGO_DB_NAME);
      const collection = db.collection<MongoUserDocument>("users");
      await collection.createIndex({ usernameLower: 1 }, { unique: true });
      await seedMongoDefaultUsers(collection);
      return collection;
    })();
  }

  return mongoCollectionPromise;
}

async function seedMongoDefaultUsers(collection: Collection<MongoUserDocument>) {
  await Promise.all(
    DEFAULT_USERS.map(({ username, password, role }, index) => {
      const usernameLower = username.toLowerCase();
      const filter = {
        $or: [{ usernameLower }, { username }],
      };

      return collection.updateOne(
        filter,
        {
          $setOnInsert: {
            id: index + 1,
            username,
            usernameLower,
            password_hash: hashSync(password, 10),
            role,
          },
          $set: {
            usernameLower,
          },
        },
        { upsert: true }
      );
    })
  );
}

async function getUserByUsernameSqlite(username: string): Promise<UserRecord | null> {
  const db = initializeSqlite();
  const stmt = db.prepare(
    `SELECT id, username, password_hash, role
     FROM users WHERE lower(username) = lower(?)`
  );
  const row = stmt.get(username) as UserRecord | undefined;
  return row ?? null;
}

async function getUserByUsernameMongo(username: string): Promise<UserRecord | null> {
  const collection = await getMongoCollection();
  const normalized = username.toLowerCase();

  let doc = await collection.findOne({ usernameLower: normalized });
  if (!doc) {
    doc = await collection.findOne({ username });
    if (doc && doc.username && doc.usernameLower !== doc.username.toLowerCase()) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { usernameLower: doc.username.toLowerCase() } }
      );
    }
  }

  if (!doc) {
    return null;
  }

  return {
    id: deriveNumericId(doc),
    username: doc.username,
    password_hash: doc.password_hash,
    role: doc.role,
  };
}

function deriveNumericId(doc: MongoUserDocument) {
  if (typeof doc.id === "number" && Number.isFinite(doc.id)) {
    return doc.id;
  }

  if (doc._id instanceof ObjectId) {
    const hex = doc._id.toHexString();
    const fallback = Number.parseInt(hex.slice(-8), 16);
    if (Number.isFinite(fallback) && fallback > 0) {
      return fallback;
    }
  }

  const hash = doc.username
    .split("")
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0);
  return hash === 0 ? 1 : hash;
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  if (useMongo) {
    return getUserByUsernameMongo(username);
  }

  return getUserByUsernameSqlite(username);
}

export function getDb() {
  if (useMongo) {
    throw new Error("getDb is only available when using the SQL database provider");
  }

  return initializeSqlite();
}
