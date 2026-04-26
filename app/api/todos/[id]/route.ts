import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { done } = await req.json();
  const rows = await sql`
    UPDATE todos SET done = ${done} WHERE id = ${id} RETURNING *
  `;
  if (!rows.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`DELETE FROM todos WHERE id = ${id}`;
  return new NextResponse(null, { status: 204 });
}
