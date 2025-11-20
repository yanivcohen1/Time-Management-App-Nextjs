import "reflect-metadata";
import DatabaseConstructor, { type Database as DatabaseInstance } from "better-sqlite3";
import { hashSync } from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import {
  Entity,
  MikroORM,
  PrimaryKey,
  Property,
  type EntityManager,
} from "@mikro-orm/core";
import { MongoDriver, ObjectId } from "@mikro-orm/mongodb";

export type Role = "user" | "admin";

type UserRecord = {
  id: number;
  username: string;
  password_hash: string;
  role: Role;
};

@Entity({ collection: "users" })
class UserEntity {
  @PrimaryKey({ type: ObjectId })
  _id!: ObjectId;

  @Property({ unique: true })
  id!: number;

  @Property()
  username!: string;

  @Property({ unique: true })
  usernameLower!: string;

  @Property()
  password_hash!: string;

  @Property()
  role!: Role;
}

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
let mongoOrmPromise: Promise<MikroORM<MongoDriver>> | null = null;

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

async function initializeMongoOrm() {
  if (!mongoOrmPromise) {
    mongoOrmPromise = MikroORM.init<MongoDriver>({
      entities: [UserEntity],
      clientUrl: MONGO_URI,
      dbName: MONGO_DB_NAME,
      driver: MongoDriver,
    }).then(async (orm: MikroORM<MongoDriver>) => {
      const generator = orm.getSchemaGenerator();
      if (typeof (generator as { ensureIndexes?: () => Promise<void> }).ensureIndexes === "function") {
        await (generator as { ensureIndexes: () => Promise<void> }).ensureIndexes();
      }
      await seedMongoDefaultUsers(orm.em);
      return orm;
    });
  }

  return mongoOrmPromise;
}

async function seedMongoDefaultUsers(em: EntityManager<MongoDriver>) {
  const fork = em.fork();
  for (const [index, { username, password, role }] of DEFAULT_USERS.entries()) {
    const usernameLower = username.toLowerCase();
    let user = await fork.findOne(UserEntity, { usernameLower });
    if (!user) {
      user = fork.create(UserEntity, {
        id: index + 1,
        username,
        usernameLower,
        password_hash: hashSync(password, 10),
        role,
      });
      fork.persist(user);
    } else {
      user.password_hash = hashSync(password, 10);
      user.role = role;
      user.id = user.id ?? index + 1;
    }
    await fork.flush();
  }
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
  const orm = await initializeMongoOrm();
  const em = orm.em.fork();
  const normalized = username.toLowerCase();

  let user = await em.findOne(UserEntity, { usernameLower: normalized });
  if (!user) {
    user = await em.findOne(UserEntity, { username });
  }

  if (!user) {
    return null;
  }

  const normalizedUsername = user.username.toLowerCase();
  if (user.usernameLower !== normalizedUsername) {
    user.usernameLower = normalizedUsername;
    await em.flush();
  }

  return {
    id: deriveNumericId(user),
    username: user.username,
    password_hash: user.password_hash,
    role: user.role,
  };
}

function deriveNumericId(doc: { username: string; id?: number; _id?: ObjectId }) {
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
