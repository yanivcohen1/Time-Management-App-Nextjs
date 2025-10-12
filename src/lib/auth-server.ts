import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByUsername, type Role } from "./db";
export type { Role } from "./db";

export type AuthenticatedUser = {
  id: number;
  username: string;
  role: Role;
};

type JwtPayload = AuthenticatedUser & {
  iat: number;
  exp: number;
};

const DEFAULT_JWT_SECRET = "focusflow-dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.FOCUSFLOW_JWT_EXPIRES_IN ?? "1h";

function getJwtSecret() {
  const secret = process.env.FOCUSFLOW_JWT_SECRET ?? DEFAULT_JWT_SECRET;
  if (secret === DEFAULT_JWT_SECRET && process.env.NODE_ENV === "production") {
    console.warn("Using default JWT secret in production. Set FOCUSFLOW_JWT_SECRET.");
  }
  return secret;
}

export async function authenticateCredentials(usernameRaw: string, password: string) {
  const username = usernameRaw.trim();
  if (!username || !password) {
    return null;
  }

  const userRow = getUserByUsername(username);
  if (!userRow) {
    return null;
  }

  const passwordMatches = await compare(password, userRow.password_hash);
  if (!passwordMatches) {
    return null;
  }

  const user: AuthenticatedUser = {
    id: userRow.id,
    username: userRow.username,
    role: userRow.role,
  };
  return user;
}

export function issueToken(user: AuthenticatedUser) {
  const secret = getJwtSecret();
  const payload: AuthenticatedUser = {
    id: user.id,
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string) {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user: AuthenticatedUser = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    return user;
  } catch (error) {
    console.warn("Failed to verify JWT", error);
    return null;
  }
}
