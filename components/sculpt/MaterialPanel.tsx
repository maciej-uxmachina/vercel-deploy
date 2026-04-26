"use client";
import { MaterialPreset, MATERIAL_CONFIGS, VALID_MATERIALS } from "@/lib/sculptureTypes";
import { LightingConfig } from "./Lighting";

interface Props {
  material: MaterialPreset;
  lightingConfig: LightingConfig;
  onMaterialChange: (m: MaterialPreset) => void;
  onLightingChange: (config: LightingConfig) => void;
}

export default function MaterialPanel({ material, lightingConfig, onMaterialChange, onLightingChange }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 w-52 shrink-0 bg-stone-900 border-l border-stone-800 overflow-y-auto">
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Material</p>
        <div className="flex flex-col gap-1">
          {VALID_MATERIALS.map((m) => {
            const cfg = MATERIAL_CONFIGS[m];
            return (
              <button
                key={m}
                onClick={() => onMaterialChange(m)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
                  material === m
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Lighting</p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Ambient</span>
              <span>{Math.round(lightingConfig.ambientIntensity * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={200} value={Math.round(lightingConfig.ambientIntensity * 100)}
              onChange={(e) => onLightingChange({ ...lightingConfig, ambientIntensity: Number(e.target.value) / 100 })}
              className="w-full accent-amber-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Light Angle</span>
              <span>{Math.round((lightingConfig.directionalAngle / Math.PI) * 180)}°</span>
            </div>
            <input
              type="range" min={0} max={628} value={Math.round(lightingConfig.directionalAngle * 100)}
              onChange={(e) => onLightingChange({ ...lightingConfig, directionalAngle: Number(e.target.value) / 100 })}
              className="w-full accent-amber-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Elevation</span>
              <span>{Math.round((lightingConfig.directionalElevation / (Math.PI / 2)) * 90)}°</span>
            </div>
            <input
              type="range" min={5} max={85} value={Math.round((lightingConfig.directionalElevation / (Math.PI / 2)) * 90)}
              onChange={(e) =>
                onLightingChange({
                  ...lightingConfig,
                  directionalElevation: (Number(e.target.value) / 90) * (Math.PI / 2),
                })
              }
              className="w-full accent-amber-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
