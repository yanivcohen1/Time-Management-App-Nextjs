import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { verifyToken, type AuthenticatedUser, type Role } from "@/lib/auth-server";

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (req: NextRequest, user: AuthenticatedUser) => {
  // {user.username, user.role}
  return NextResponse.json(users);
}); // if not set default is { roles: ["user"] }

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  const { name, email } = body as { name: string; email: string };
  const newUser: User = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}, { roles: ["admin"] }); // if not set default is { roles: ["user"] }
