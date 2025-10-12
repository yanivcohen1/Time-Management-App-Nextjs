import { NextRequest, NextResponse } from "next/server";
import { authenticateCredentials, issueToken } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
  }

  const user = await authenticateCredentials(username, password);
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = issueToken(user);
  return NextResponse.json(
    {
      token,
      user,
    },
    { status: 200 }
  );
}
