import { ensureSculpturesTable, getSql } from "@/lib/db";
import { SculptureListItem } from "@/lib/sculptureTypes";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  await ensureSculpturesTable();
  const sql = getSql();
  const sculptures = await sql`
    SELECT id, nickname, material, preview_image, created_at
    FROM sculptures
    ORDER BY created_at DESC
  ` as SculptureListItem[];

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sculpt Gallery</h1>
          <p className="text-stone-400 text-sm mt-0.5">Community 3D sculptures</p>
        </div>
        <a
          href="/create"
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          + Create
        </a>
      </header>
      <GalleryGrid sculptures={sculptures} />
    </main>
  );
}
