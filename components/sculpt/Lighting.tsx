"use client";

export interface LightingConfig {
  ambientIntensity: number;
  directionalAngle: number;
  directionalElevation: number;
}

interface Props {
  config: LightingConfig;
}

export default function Lighting({ config }: Props) {
  const { ambientIntensity, directionalAngle, directionalElevation } = config;
  const r = 4;
  const x = Math.sin(directionalAngle) * Math.cos(directionalElevation) * r;
  const y = Math.sin(directionalElevation) * r;
  const z = Math.cos(directionalAngle) * Math.cos(directionalElevation) * r;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#ffffff" />
      <directionalLight
        position={[x, y, z]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-radius={4}
      />
      <directionalLight position={[-x, y * 0.5, -z]} intensity={0.3} color="#8eb4d4" />
    </>
  );
}
