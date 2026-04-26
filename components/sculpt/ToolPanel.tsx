"use client";
import { ToolType } from "@/lib/sculptureTypes";

interface Props {
  activeTool: ToolType;
  brushSize: number;
  brushStrength: number;
  onToolChange: (t: ToolType) => void;
  onBrushSizeChange: (v: number) => void;
  onBrushStrengthChange: (v: number) => void;
  onUndo: () => void;
  onReset: () => void;
  onHandTrackingToggle: () => void;
  handTrackingEnabled: boolean;
}

const TOOLS: { id: ToolType; label: string; icon: string; desc: string }[] = [
  { id: 'inflate',  label: 'Inflate',  icon: '⬆', desc: 'Push outward' },
  { id: 'deflate',  label: 'Deflate',  icon: '⬇', desc: 'Push inward' },
  { id: 'smooth',   label: 'Smooth',   icon: '〜', desc: 'Soften surface' },
  { id: 'flatten',  label: 'Flatten',  icon: '▬', desc: 'Flatten region' },
  { id: 'grab',     label: 'Grab',     icon: '✥', desc: 'Drag vertices' },
];

export default function ToolPanel({
  activeTool, brushSize, brushStrength,
  onToolChange, onBrushSizeChange, onBrushStrengthChange,
  onUndo, onReset, onHandTrackingToggle, handTrackingEnabled,
}: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 w-52 shrink-0 bg-stone-900 border-r border-stone-800 overflow-y-auto">
      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Tools</p>
        <div className="flex flex-col gap-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => onToolChange(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
                activeTool === t.id
                  ? 'bg-amber-500 text-stone-950 font-semibold'
                  : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <span className="text-base w-5 text-center">{t.icon}</span>
              <div>
                <div className="font-medium">{t.label}</div>
                <div className={`text-xs ${activeTool === t.id ? 'text-stone-800' : 'text-stone-500'}`}>{t.desc}</div>
              </div>
            </button>
          ))}

          <div className="my-1 border-t border-stone-800" />

          <button
            onClick={onHandTrackingToggle}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
              handTrackingEnabled
                ? 'bg-green-600 text-white font-semibold'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <span className="text-base w-5 text-center">✋</span>
            <div>
              <div className="font-medium">Hand Sculpt</div>
              <div className={`text-xs ${handTrackingEnabled ? 'text-green-200' : 'text-stone-500'}`}>
                {handTrackingEnabled ? 'Webcam active' : 'Use your hands'}
              </div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Brush</p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Size</span><span>{brushSize}</span>
            </div>
            <input
              type="range" min={5} max={80} value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Strength</span><span>{brushStrength}</span>
            </div>
            <input
              type="range" min={1} max={100} value={brushStrength}
              onChange={(e) => onBrushStrengthChange(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <button
          onClick={onUndo}
          className="px-3 py-2 rounded-lg text-sm bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center gap-2"
        >
          <span>↩</span> Undo <span className="text-stone-500 text-xs ml-auto">⌘Z</span>
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2 rounded-lg text-sm bg-stone-800 hover:bg-red-900 text-stone-300 hover:text-red-300 transition-colors flex items-center gap-2"
        >
          <span>↺</span> Reset
        </button>
      </div>
    </div>
  );
}
