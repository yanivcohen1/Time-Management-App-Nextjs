import { NextRequest, NextResponse } from "next/server";

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

export async function GET() {
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email } = body as { name: string; email: string };
  const newUser: User = { id: users.length + 1, name, email };
  users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}
