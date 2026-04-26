"use client";
import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import Lighting, { LightingConfig } from "./Lighting";
import SculptMesh, { SculptMeshHandle } from "./SculptMesh";
import { ToolType, MaterialPreset } from "@/lib/sculptureTypes";

interface Props {
  activeTool: ToolType;
  brushSize: number;
  brushStrength: number;
  material: MaterialPreset;
  lightingConfig: LightingConfig;
  meshRef: React.RefObject<SculptMeshHandle | null>;
}

export default function SculptCanvas({
  activeTool,
  brushSize,
  brushStrength,
  material,
  lightingConfig,
  meshRef,
}: Props) {
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 3], fov: 50 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      className="w-full h-full"
    >
      <Lighting config={lightingConfig} />
      <SculptMesh
        ref={meshRef}
        activeTool={activeTool}
        brushSize={brushSize}
        brushStrength={brushStrength}
        material={material}
        onOrbitEnable={setOrbitEnabled}
      />
      <OrbitControls
        ref={orbitRef}
        enabled={orbitEnabled}
        makeDefault
        minDistance={1.2}
        maxDistance={8}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
