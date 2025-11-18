import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { type AuthenticatedUser } from "@/lib/auth-server";

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

export const GET = withAuth(async (req: NextRequest, user: AuthenticatedUser) => {
  const limitParam = req.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const limitedUsers =
    typeof parsedLimit === "number" && Number.isFinite(parsedLimit) && parsedLimit > 0
      ? users.slice(0, parsedLimit)
      : users;

  return NextResponse.json({
    requestedBy: {
      username: user.username,
      role: user.role,
    },
    users: limitedUsers,
  });
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
