"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ToolType, MaterialPreset } from "@/lib/sculptureTypes";
import { LightingConfig } from "./Lighting";
import ToolPanel from "./ToolPanel";
import MaterialPanel from "./MaterialPanel";
import SaveDialog from "./SaveDialog";
import { SculptMeshHandle } from "./SculptMesh";

const SculptCanvas = dynamic(() => import("./SculptCanvas"), { ssr: false });
const HandTracker = dynamic(() => import("./HandTracker"), { ssr: false });

const DEFAULT_LIGHTING: LightingConfig = {
  ambientIntensity: 0.6,
  directionalAngle: Math.PI / 4,
  directionalElevation: Math.PI / 4,
};

export default function SculptPage() {
  const meshRef = useRef<SculptMeshHandle | null>(null);

  const [activeTool, setActiveTool] = useState<ToolType>("inflate");
  const [brushSize, setBrushSize] = useState(30);
  const [brushStrength, setBrushStrength] = useState(30);
  const [material, setMaterial] = useState<MaterialPreset>("clay");
  const [lightingConfig, setLightingConfig] = useState<LightingConfig>(DEFAULT_LIGHTING);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Keyboard undo
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        meshRef.current?.undo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSculptGesture(x: number, y: number) {
    // x, y are normalized [0,1] from MediaPipe (mirrored video)
    // flip x because video is mirror-flipped in UI
    const ndcX = (1 - x) * 2 - 1;
    const ndcY = -(y * 2 - 1);
    meshRef.current?.sculptAtNDC(ndcX, ndcY);
  }

  function handleRotateGesture(dx: number, dy: number) {
    // Dispatch a synthetic pointer drag on the canvas so OrbitControls picks it up
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    canvas.dispatchEvent(new PointerEvent("pointermove", {
      bubbles: true, buttons: 2,
      clientX: cx + dx * 400, clientY: cy + dy * 400,
      pointerId: 99, isPrimary: true,
    }));
  }

  function handlePinchStart() {
    meshRef.current?.startHandStroke();
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden">
      {/* Top bar */}
      <header className="border-b border-stone-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <a href="/" className="text-stone-400 hover:text-stone-200 transition-colors text-sm flex items-center gap-1.5">
          ← Gallery
        </a>
        <h1 className="text-sm font-semibold text-stone-300">Sculpt</h1>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors"
        >
          Save & Share
        </button>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <ToolPanel
          activeTool={activeTool}
          brushSize={brushSize}
          brushStrength={brushStrength}
          onToolChange={setActiveTool}
          onBrushSizeChange={setBrushSize}
          onBrushStrengthChange={setBrushStrength}
          onUndo={() => meshRef.current?.undo()}
          onReset={() => meshRef.current?.resetMesh()}
          onHandTrackingToggle={() => setHandTrackingEnabled((v) => !v)}
          handTrackingEnabled={handTrackingEnabled}
        />

        <div className="flex-1 relative">
          <SculptCanvas
            activeTool={activeTool}
            brushSize={brushSize}
            brushStrength={brushStrength}
            material={material}
            lightingConfig={lightingConfig}
            meshRef={meshRef}
          />

          {handTrackingEnabled && (
            <HandTracker
              onSculptGesture={handleSculptGesture}
              onRotateGesture={handleRotateGesture}
              onPinchStart={handlePinchStart}
            />
          )}

          {/* Cursor hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-xs text-stone-600 bg-stone-950/80 px-3 py-1 rounded-full">
              Click & drag to sculpt · Right drag or two-finger to orbit
            </p>
          </div>
        </div>

        <MaterialPanel
          material={material}
          lightingConfig={lightingConfig}
          onMaterialChange={setMaterial}
          onLightingChange={setLightingConfig}
        />
      </div>

      {showSaveDialog && (
        <SaveDialog
          meshRef={meshRef}
          material={material}
          onClose={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
}
