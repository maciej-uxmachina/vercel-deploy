"use client";
import { SculptureListItem } from "@/lib/sculptureTypes";
import SculptureTile from "./SculptureTile";

interface Props {
  sculptures: SculptureListItem[];
}

export default function GalleryGrid({ sculptures }: Props) {
  return (
    <div className="px-6 py-8">
      {sculptures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-stone-500">
          <p className="text-6xl mb-4">🗿</p>
          <p className="text-lg font-medium">No sculptures yet</p>
          <p className="text-sm mt-1">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {sculptures.map((s) => (
            <SculptureTile key={s.id} sculpture={s} />
          ))}
        </div>
      )}
    </div>
  );
}
