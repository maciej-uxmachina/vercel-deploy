"use client";
import { useState } from "react";
import { SculptureListItem, MATERIAL_CONFIGS } from "@/lib/sculptureTypes";

interface Props {
  sculpture: SculptureListItem;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function SculptureTile({ sculpture }: Props) {
  const [hovered, setHovered] = useState(false);
  const mat = MATERIAL_CONFIGS[sculpture.material];

  return (
    <div
      className="rounded-xl overflow-hidden bg-stone-900 border border-stone-800 hover:border-stone-600 transition-colors cursor-default group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-square relative bg-stone-800 overflow-hidden">
        {sculpture.preview_image ? (
          <img
            src={sculpture.preview_image}
            alt={`Sculpture by ${sculpture.nickname}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `radial-gradient(circle, ${mat.color}44, #1c1917)` }}
          >
            <div
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: mat.color, opacity: 0.7 }}
            />
          </div>
        )}
        {hovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: mat.color + 'cc', color: '#111' }}
            >
              {mat.label}
            </span>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="font-semibold text-sm truncate">{sculpture.nickname}</p>
        <p className="text-stone-500 text-xs mt-0.5">{formatDate(sculpture.created_at)}</p>
      </div>
    </div>
  );
}
