declare module 'js-yaml';

import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const configPath = path.join(process.cwd(), "config.yaml");
const config = yaml.load(fs.readFileSync(configPath, "utf8")) as {
  port: number;
  jwtSecret: string;
  dbPath: string;
};

// Set environment variables from config
process.env.PORT = config.port.toString();
process.env.FOCUSFLOW_JWT_SECRET = config.jwtSecret;
process.env.FOCUSFLOW_DB_PATH = config.dbPath;

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
