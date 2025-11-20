declare module 'js-yaml';

import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const configPath = path.join(process.cwd(), "config.yaml");
type ConfigFileShape = {
  port: number;
  jwtSecret: string;
  dbPath?: string | { sql?: string; mongo?: string };
  mongoPath?: string;
  dbProvider?: string;
  logLevel?: string;
};

const config = yaml.load(fs.readFileSync(configPath, "utf8")) as ConfigFileShape;

const rawDbPath = config.dbPath;
const sqlPath =
  typeof rawDbPath === "string"
    ? rawDbPath
    : rawDbPath?.sql ?? "data/focusflow.db";
const mongoFromDbPath =
  typeof rawDbPath === "object" && rawDbPath !== null && typeof rawDbPath.mongo === "string"
    ? rawDbPath.mongo
    : undefined;

const mongoPath = mongoFromDbPath ?? config.mongoPath ?? "mongodb://localhost:27017/focusflow";
const providerRaw = (config.dbProvider ?? "sql").toLowerCase();
const normalizedProvider = ["mongo", "mongodb"].includes(providerRaw) ? "mongo" : "sql";
const logLevel = config.logLevel ?? "info";

// Set environment variables from config
process.env.PORT = config.port.toString();
process.env.FOCUSFLOW_JWT_SECRET = config.jwtSecret;
process.env.FOCUSFLOW_DB_PATH = sqlPath;
process.env.FOCUSFLOW_MONGO_URI = mongoPath;
process.env.FOCUSFLOW_DB_PROVIDER = normalizedProvider;
process.env.FOCUSFLOW_LOG_LEVEL = logLevel;

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@mikro-orm/core",
      "@mikro-orm/mongodb",
      "@mikro-orm/migrations-mongodb",
      "@mikro-orm/reflection",
    ],
  },
};

export default nextConfig;
