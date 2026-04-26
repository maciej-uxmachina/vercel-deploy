"use client";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ToolType, MaterialPreset, MATERIAL_CONFIGS } from "@/lib/sculptureTypes";
import { brushWeight, averagePosition, fitPlaneNormal } from "@/lib/sculptingMath";
import { UndoManager } from "./UndoManager";

export interface SculptMeshHandle {
  captureScreenshot: () => string;
  getGeometryData: () => { positions: number[] };
  resetMesh: () => void;
  undo: () => void;
  sculptAtNDC: (ndcX: number, ndcY: number) => void;
  startHandStroke: () => void;
}

interface Props {
  activeTool: ToolType;
  brushSize: number;
  brushStrength: number;
  material: MaterialPreset;
  onOrbitEnable: (enabled: boolean) => void;
}

function buildAdjacencyMap(geo: THREE.BufferGeometry): Map<number, number[]> {
  const map = new Map<number, number[]>();
  function addTriangle(a: number, b: number, c: number) {
    for (const [v, ns] of [[a, [b, c]], [b, [a, c]], [c, [a, b]]] as [number, number[]][]) {
      if (!map.has(v)) map.set(v, []);
      const list = map.get(v)!;
      for (const n of ns) if (!list.includes(n)) list.push(n);
    }
  }
  if (geo.index) {
    const idx = geo.index;
    for (let i = 0; i < idx.count; i += 3) addTriangle(idx.getX(i), idx.getX(i + 1), idx.getX(i + 2));
  } else {
    const count = geo.attributes.position.count;
    for (let i = 0; i < count; i += 3) addTriangle(i, i + 1, i + 2);
  }
  return map;
}

function createBaseMesh() {
  // mergeVertices deduplicates all coincident vertices so that tools like
  // inflate/deflate (which displace along per-vertex normals) never split
  // faces at seam boundaries — that's what causes visible gaps.
  const geo = mergeVertices(new THREE.IcosahedronGeometry(1, 4));
  geo.computeVertexNormals();
  return geo;
}

const SculptMesh = forwardRef<SculptMeshHandle, Props>(
  ({ activeTool, brushSize, brushStrength, material, onOrbitEnable }, ref) => {
    const { gl, camera, scene } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const isStroking = useRef(false);
    const undoManager = useRef(new UndoManager());
    const adjacencyMap = useRef<Map<number, number[]>>(new Map());
    const originalPositions = useRef<Float32Array>(new Float32Array());
    const grabOrigin = useRef<THREE.Vector3 | null>(null);
    const prevGrabPoint = useRef<THREE.Vector3 | null>(null);
    const raycaster = useRef(new THREE.Raycaster());

    const geometry = useMemo(() => {
      const geo = createBaseMesh();
      adjacencyMap.current = buildAdjacencyMap(geo);
      originalPositions.current = (geo.attributes.position.array as Float32Array).slice();
      return geo;
    }, []);

    const matConfig = MATERIAL_CONFIGS[material];

    useImperativeHandle(ref, () => ({
      captureScreenshot() {
        gl.render(scene, camera);
        return gl.domElement.toDataURL("image/webp", 0.7);
      },
      getGeometryData() {
        const pos = geometry.attributes.position.array as Float32Array;
        return { positions: Array.from(pos) };
      },
      resetMesh() {
        const attr = geometry.attributes.position as THREE.BufferAttribute;
        (attr.array as Float32Array).set(originalPositions.current);
        attr.needsUpdate = true;
        geometry.computeVertexNormals();
        undoManager.current.clear();
      },
      undo() {
        const snapshot = undoManager.current.pop();
        if (!snapshot) return;
        const attr = geometry.attributes.position as THREE.BufferAttribute;
        (attr.array as Float32Array).set(snapshot);
        attr.needsUpdate = true;
        geometry.computeVertexNormals();
      },
      startHandStroke() {
        undoManager.current.push(geometry.attributes.position.array as Float32Array);
      },
      sculptAtNDC(ndcX: number, ndcY: number) {
        if (!meshRef.current) return;
        raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        const hits = raycaster.current.intersectObject(meshRef.current);
        if (hits.length === 0) return;
        applyTool(hits[0].point);
      },
    }));

    function applyTool(worldPoint: THREE.Vector3) {
      if (!meshRef.current) return;
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const normAttr = geometry.attributes.normal as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const normals = normAttr.array as Float32Array;

      const localPoint = meshRef.current.worldToLocal(worldPoint.clone());
      const radius = brushSize / 100;
      const radiusSq = radius * radius;
      const strength = brushStrength / 1000;
      const count = positions.length / 3;

      // Collect affected vertex indices and their weights
      const affected: number[] = [];
      const weights: number[] = [];
      for (let i = 0; i < count; i++) {
        const dx = positions[i * 3] - localPoint.x;
        const dy = positions[i * 3 + 1] - localPoint.y;
        const dz = positions[i * 3 + 2] - localPoint.z;
        const w = brushWeight(dx * dx + dy * dy + dz * dz, radiusSq);
        if (w > 0) { affected.push(i); weights.push(w); }
      }

      if (activeTool === 'inflate' || activeTool === 'deflate') {
        const sign = activeTool === 'inflate' ? 1 : -1;
        for (let k = 0; k < affected.length; k++) {
          const i = affected[k], w = weights[k];
          positions[i * 3]     += normals[i * 3]     * sign * w * strength;
          positions[i * 3 + 1] += normals[i * 3 + 1] * sign * w * strength;
          positions[i * 3 + 2] += normals[i * 3 + 2] * sign * w * strength;
        }
      } else if (activeTool === 'smooth') {
        for (let k = 0; k < affected.length; k++) {
          const i = affected[k], w = weights[k];
          const neighbors = adjacencyMap.current.get(i) ?? [];
          if (neighbors.length === 0) continue;
          const [ax, ay, az] = averagePosition(positions, neighbors);
          const t = w * strength * 10;
          positions[i * 3]     += (ax - positions[i * 3])     * t;
          positions[i * 3 + 1] += (ay - positions[i * 3 + 1]) * t;
          positions[i * 3 + 2] += (az - positions[i * 3 + 2]) * t;
        }
      } else if (activeTool === 'flatten') {
        if (affected.length >= 3) {
          const [pnx, pny, pnz] = fitPlaneNormal(positions, affected);
          const len = Math.sqrt(pnx * pnx + pny * pny + pnz * pnz);
          if (len > 0.0001) {
            const nx = pnx / len, ny = pny / len, nz = pnz / len;
            const [cx, cy, cz] = averagePosition(positions, affected);
            for (let k = 0; k < affected.length; k++) {
              const i = affected[k], w = weights[k];
              const dot = (positions[i * 3] - cx) * nx + (positions[i * 3 + 1] - cy) * ny + (positions[i * 3 + 2] - cz) * nz;
              const t = w * strength * 10;
              positions[i * 3]     -= nx * dot * t;
              positions[i * 3 + 1] -= ny * dot * t;
              positions[i * 3 + 2] -= nz * dot * t;
            }
          }
        }
      } else if (activeTool === 'grab') {
        if (prevGrabPoint.current && grabOrigin.current) {
          const prevLocal = meshRef.current.worldToLocal(prevGrabPoint.current.clone());
          const delta = localPoint.clone().sub(prevLocal);
          const grabLocal = meshRef.current.worldToLocal(grabOrigin.current.clone());
          for (let i = 0; i < count; i++) {
            const dx = positions[i * 3] - grabLocal.x;
            const dy = positions[i * 3 + 1] - grabLocal.y;
            const dz = positions[i * 3 + 2] - grabLocal.z;
            const w = brushWeight(dx * dx + dy * dy + dz * dz, radiusSq);
            if (w === 0) continue;
            positions[i * 3]     += delta.x * w;
            positions[i * 3 + 1] += delta.y * w;
            positions[i * 3 + 2] += delta.z * w;
          }
        }
        prevGrabPoint.current = worldPoint.clone();
      }

      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();
    }

    function onPointerDown(e: { point: THREE.Vector3 }) {
      isStroking.current = true;
      onOrbitEnable(false);
      undoManager.current.push(geometry.attributes.position.array as Float32Array);
      if (activeTool === 'grab') {
        grabOrigin.current = e.point.clone();
        prevGrabPoint.current = null;
      }
      applyTool(e.point);
    }

    function onPointerMove(e: { point: THREE.Vector3; buttons: number }) {
      if (!isStroking.current || e.buttons === 0) return;
      applyTool(e.point);
    }

    function onPointerUp() {
      isStroking.current = false;
      onOrbitEnable(true);
      if (activeTool === 'grab') {
        grabOrigin.current = null;
        prevGrabPoint.current = null;
      }
    }

    useEffect(() => () => geometry.dispose(), [geometry]);

    return (
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerDown={onPointerDown as never}
        onPointerMove={onPointerMove as never}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={matConfig.color}
          roughness={matConfig.roughness}
          metalness={matConfig.metalness}
          transparent={matConfig.transparent ?? false}
          opacity={matConfig.opacity ?? 1}
        />
      </mesh>
    );
  }
);

SculptMesh.displayName = "SculptMesh";
export default SculptMesh;
