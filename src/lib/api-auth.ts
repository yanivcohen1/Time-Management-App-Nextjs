import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type AuthenticatedUser, type Role } from "./auth-server";

type MaybeResponse = NextResponse | void;

type AuthedHandler<T> = (
  req: NextRequest,
  user: AuthenticatedUser
) => Promise<T> | T;

type RequireAuthOptions = {
  roles?: Role[];
};

export function extractBearerToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return authHeader.split(" ", 2)[1] ?? null;
}

export function requireAuth(
  req: NextRequest,
  options: RequireAuthOptions = {}
): { user: AuthenticatedUser } | { response: NextResponse } {
  const token = extractBearerToken(req);
  if (!token) {
    return {
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = verifyToken(token);
  if (!user) {
    return {
      response: NextResponse.json({ message: "Invalid or expired token" }, { status: 401 }),
    };
  }

  const allowedRoles = options.roles ?? ["user"];

  if (!allowedRoles.includes(user.role)) {
    return {
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}

export function withAuth<T>(handler: AuthedHandler<T>, options?: RequireAuthOptions) {
  return async function (req: NextRequest): Promise<T | MaybeResponse> {
    const result = requireAuth(req, options ?? { roles: ["user", "admin"] });
    if ("response" in result) {
      return result.response;
    }
    return handler(req, result.user);
  };
}
