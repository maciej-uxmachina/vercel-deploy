// Smooth step falloff kernel — returns 0 at distSq >= radiusSq, 1 at center
export function brushWeight(distSq: number, radiusSq: number): number {
  if (distSq >= radiusSq) return 0;
  const t = 1 - distSq / radiusSq;
  return t * t * (3 - 2 * t); // smoothstep
}

// Average position of a set of vertices (returns [x,y,z])
export function averagePosition(
  positions: Float32Array,
  indices: number[]
): [number, number, number] {
  let x = 0, y = 0, z = 0;
  for (const i of indices) {
    x += positions[i * 3];
    y += positions[i * 3 + 1];
    z += positions[i * 3 + 2];
  }
  const n = indices.length || 1;
  return [x / n, y / n, z / n];
}

// Compute best-fit plane normal for a set of vertices (PCA via covariance)
// Returns normal as [nx, ny, nz] (not normalized — caller normalizes)
export function fitPlaneNormal(
  positions: Float32Array,
  indices: number[]
): [number, number, number] {
  const [cx, cy, cz] = averagePosition(positions, indices);
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  for (const i of indices) {
    const dx = positions[i * 3] - cx;
    const dy = positions[i * 3 + 1] - cy;
    const dz = positions[i * 3 + 2] - cz;
    xx += dx * dx; xy += dx * dy; xz += dx * dz;
    yy += dy * dy; yz += dy * dz; zz += dz * dz;
  }
  // Smallest eigenvector of the covariance matrix approximated by cross products
  // of the two row vectors with largest magnitude
  const r0 = [xx, xy, xz];
  const r1 = [xy, yy, yz];
  const r2 = [xz, yz, zz];
  const cross = (a: number[], b: number[]): [number, number, number] => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const c01 = cross(r0, r1);
  const c02 = cross(r0, r2);
  const c12 = cross(r1, r2);
  const len = (v: number[]) => v[0] ** 2 + v[1] ** 2 + v[2] ** 2;
  const best = [c01, c02, c12].reduce((a, b) => (len(a) >= len(b) ? a : b));
  return best as [number, number, number];
}
