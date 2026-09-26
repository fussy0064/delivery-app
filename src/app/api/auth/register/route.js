import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { hashPassword, signToken, COOKIE } from "@/lib/auth";

export async function POST(req) {
  const { name, email, phone, password, role } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const passwordHash = hashPassword(password);
  const result = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role`,
    [name, email, phone || null, passwordHash, role || "user"]
  );

  const user = result.rows[0];
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  });

  const res = NextResponse.json({ user });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
