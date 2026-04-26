import { NextResponse } from "next/server";
import { getSql, ensureSculpturesTable } from "@/lib/db";
import { VALID_MATERIALS } from "@/lib/sculptureTypes";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSculpturesTable();
  const sql = getSql();
  const rows = await sql`
    SELECT id, nickname, material, preview_image, created_at
    FROM sculptures
    ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nickname, geometry_data, material, preview_image } = body;

  if (!nickname?.trim()) {
    return NextResponse.json({ error: "nickname is required" }, { status: 400 });
  }
  if (!geometry_data?.positions?.length) {
    return NextResponse.json({ error: "geometry_data is required" }, { status: 400 });
  }
  if (!VALID_MATERIALS.includes(material)) {
    return NextResponse.json({ error: "invalid material" }, { status: 400 });
  }

  await ensureSculpturesTable();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO sculptures (nickname, geometry_data, material, preview_image)
    VALUES (
      ${nickname.trim()},
      ${JSON.stringify(geometry_data)},
      ${material},
      ${preview_image ?? null}
    )
    RETURNING *
  `;
  return NextResponse.json((rows as Record<string, unknown>[])[0], { status: 201 });
}
