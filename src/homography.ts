/**
 * Homography-based projection: image (x,y) → map (lon, lat).
 * Uses 4-point DLT for projective transform (no OpenCV/Homography.js dependency).
 */

import type { FeatureCollection, Feature, Point } from "geojson";
import type { GCP, PointToProject } from "./types";

const R = 111320; // m per degree lat (WGS84 approx)

/** 3×3 homography matrix (row-major: [h11, h12, h13, h21, h22, h23, h31, h32, 1]) */
export type HomographyMatrix = number[];

/**
 * Compute 3×3 projective homography from 4 point pairs using DLT.
 * Same result as OpenCV getPerspectiveTransform(src, dst).
 */
export function getPerspectiveTransform4(
  src: [number, number][],
  dst: [number, number][]
): HomographyMatrix {
  if (src.length < 4 || dst.length < 4) {
    throw new Error("Need at least 4 point pairs for projective homography");
  }
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [xp, yp] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * xp, -y * xp]);
    b.push(xp);
    A.push([0, 0, 0, x, y, 1, -x * yp, -y * yp]);
    b.push(yp);
  }
  const h = solve8(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function solve8(A: number[][], b: number[]): number[] {
  const n = 8;
  const Ab: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(Ab[row][col]) > Math.abs(Ab[maxRow][col])) maxRow = row;
    }
    [Ab[col], Ab[maxRow]] = [Ab[maxRow], Ab[col]];
    const pivot = Ab[col][col];
    if (Math.abs(pivot) < 1e-10) throw new Error("Singular matrix in homography DLT");
    for (let j = col; j <= n; j++) Ab[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = Ab[row][col];
      for (let j = col; j <= n; j++) Ab[row][j] -= f * Ab[col][j];
    }
  }
  return Ab.map((row) => row[n]);
}

/** Apply homography H to point (x, y); returns [east_m, north_m]. */
export function applyHomography(H: HomographyMatrix, x: number, y: number): [number, number] {
  const w = H[6] * x + H[7] * y + 1;
  if (Math.abs(w) < 1e-10) throw new Error("Homography: point at infinity");
  const e = (H[0] * x + H[1] * y + H[2]) / w;
  const n = (H[3] * x + H[4] * y + H[5]) / w;
  return [e, n];
}

/** Convert local east/north (m) to lon/lat using reference point. */
export function localToLonLat(
  refLon: number,
  refLat: number,
  eastM: number,
  northM: number
): [number, number] {
  const latRad = (refLat * Math.PI) / 180;
  const lon = refLon + eastM / (R * Math.cos(latRad));
  const lat = refLat + northM / R;
  return [lon, lat];
}

/** GCPs + points to project → GeoJSON FeatureCollection (points only). */
export function projectToGeoJSON(
  gcps: GCP[],
  pointsToProject: PointToProject[]
): FeatureCollection<Point> {
  if (gcps.length < 4) {
    return { type: "FeatureCollection", features: [] };
  }
  const refLon = gcps.reduce((s, g) => s + g.lon, 0) / gcps.length;
  const refLat = gcps.reduce((s, g) => s + g.lat, 0) / gcps.length;
  const latRad = (refLat * Math.PI) / 180;

  const srcPts: [number, number][] = gcps.map((g) => [g.image_x, g.image_y]);
  const dstPts: [number, number][] = gcps.map((g) => {
    const eastM = (g.lon - refLon) * (R * Math.cos(latRad));
    const northM = (g.lat - refLat) * R;
    return [eastM, northM];
  });

  const H = getPerspectiveTransform4(srcPts, dstPts);
  const features: Feature<Point>[] = [];

  for (const pt of pointsToProject) {
    const [eastM, northM] = applyHomography(H, pt.image_x, pt.image_y);
    const [lon, lat] = localToLonLat(refLon, refLat, eastM, northM);
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: { name: pt.label || "point" },
    });
  }

  return { type: "FeatureCollection", features };
}
