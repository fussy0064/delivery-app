import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyPassword, signToken, COOKIE } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
  });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
