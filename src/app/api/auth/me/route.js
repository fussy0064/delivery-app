import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, COOKIE } from "@/lib/auth";

export async function GET() {
  const token = cookies().get(COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

  return NextResponse.json({ user: payload || null });
}
