import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken, COOKIE } from "@/lib/auth";

function getUser() {
  const token = cookies().get(COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function GET(req, { params }) {
  const result = await pool.query("SELECT * FROM orders WHERE id = $1", [params.id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order: result.rows[0] });
}

export async function PATCH(req, { params }) {
  const user = getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { status } = await req.json();
  const allowed = ["accepted", "picked", "on_the_way", "delivered"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  let result;
  if (status === "accepted") {
    result = await pool.query(
      `UPDATE orders SET status = $1, driver_id = $2 WHERE id = $3 RETURNING *`,
      [status, user.id, params.id]
    );
  } else {
    result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, params.id]
    );
  }

  return NextResponse.json({ order: result.rows[0] });
}
