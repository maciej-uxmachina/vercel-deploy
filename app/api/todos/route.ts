import { NextResponse } from "next/server";
import { sql, ensureTable } from "@/lib/db";

export async function GET() {
  await ensureTable();
  const { rows } = await sql`SELECT * FROM todos ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  await ensureTable();
  const { rows } = await sql`
    INSERT INTO todos (text) VALUES (${text.trim()}) RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
