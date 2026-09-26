import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken, COOKIE } from "@/lib/auth";

function getUser() {
  const token = cookies().get(COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");

  let result;
  if (scope === "board") {
    result = await pool.query(
      `SELECT * FROM orders
       WHERE status IN ('pending','accepted','picked','on_the_way')
       ORDER BY created_at DESC`
    );
  } else {
    const user = getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
  }

  return NextResponse.json({ orders: result.rows });
}

export async function POST(req) {
  const user = getUser();
  if (!user) {
    return NextResponse.json({ error: "Please login first" }, { status: 401 });
  }

  const body = await req.json();
  const { type, from_address, to_address, items, total_amount } = body;

  if (!type || !to_address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO orders (user_id, type, status, from_address, to_address, items, total_amount)
     VALUES ($1, $2, 'pending', $3, $4, $5, $6) RETURNING *`,
    [user.id, type, from_address || "", to_address, JSON.stringify(items || []), total_amount || 0]
  );

  return NextResponse.json({ order: result.rows[0] });
}
