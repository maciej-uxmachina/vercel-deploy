"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialPreset } from "@/lib/sculptureTypes";
import { SculptMeshHandle } from "./SculptMesh";

interface Props {
  meshRef: React.RefObject<SculptMeshHandle | null>;
  material: MaterialPreset;
  onClose: () => void;
}

export default function SaveDialog({ meshRef, material, onClose }: Props) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    if (!nickname.trim()) {
      setError("Please enter a nickname");
      inputRef.current?.focus();
      return;
    }
    if (!meshRef.current) return;

    setSaving(true);
    setError(null);

    try {
      const preview_image = meshRef.current.captureScreenshot();
      const geometry_data = meshRef.current.getGeometryData();

      const res = await fetch("/api/sculptures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), geometry_data, material, preview_image }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold mb-1">Save Sculpture</h2>
        <p className="text-stone-400 text-sm mb-5">Give your creation a name to share it in the gallery.</p>

        <label className="block mb-4">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest block mb-1.5">Nickname</span>
          <input
            ref={inputRef}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Your name or alias"
            maxLength={50}
            autoFocus
            className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
          />
        </label>

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !nickname.trim()}
            className="flex-1 py-2.5 rounded-lg text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save & Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
