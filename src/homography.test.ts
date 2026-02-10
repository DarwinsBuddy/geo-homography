import { describe, it, expect } from "vitest";
import {
  getPerspectiveTransform4,
  applyHomography,
  localToLonLat,
  projectToGeoJSON,
  type HomographyMatrix,
} from "./homography";
import type { GCP, PointToProject } from "./types";

// Unit square (0,0)-(1,1) → same (identity-like mapping with scale)
const unitSquare: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

describe("getPerspectiveTransform4", () => {
  it("computes identity-like transform for unit square to unit square", () => {
    const H = getPerspectiveTransform4(unitSquare, unitSquare);
    expect(H).toHaveLength(9);
    expect(H[8]).toBe(1);
  });

  it("throws when fewer than 4 source points", () => {
    expect(() =>
      getPerspectiveTransform4(
        [[0, 0], [1, 0], [1, 1]],
        [[0, 0], [1, 0], [1, 1]]
      )
    ).toThrow("Need at least 4 point pairs");
  });

  it("throws when fewer than 4 destination points", () => {
    expect(() =>
      getPerspectiveTransform4(unitSquare, [[0, 0], [1, 0], [1, 1]])
    ).toThrow("Need at least 4 point pairs");
  });
});

describe("applyHomography", () => {
  it("maps (0,0) with identity-like matrix to finite point", () => {
    const H: HomographyMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const [e, n] = applyHomography(H, 0, 0);
    expect(e).toBe(0);
    expect(n).toBe(0);
  });

  it("maps (1,1) with identity matrix to (1,1)", () => {
    const H: HomographyMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const [e, n] = applyHomography(H, 1, 1);
    expect(e).toBe(1);
    expect(n).toBe(1);
  });
});

describe("localToLonLat", () => {
  it("returns ref when east and north are zero", () => {
    const [lon, lat] = localToLonLat(-79.9, 43.65, 0, 0);
    expect(lon).toBe(-79.9);
    expect(lat).toBe(43.65);
  });

  it("increases lon for positive east at mid-lat", () => {
    const [lon] = localToLonLat(0, 45, 1000, 0);
    expect(lon).toBeGreaterThan(0);
  });

  it("increases lat for positive north", () => {
    const [, lat] = localToLonLat(0, 0, 0, 1000);
    expect(lat).toBeGreaterThan(0);
  });
});

describe("projectToGeoJSON", () => {
  it("returns empty FeatureCollection when fewer than 4 GCPs", () => {
    const gcps: GCP[] = [
      { image_x: 0, image_y: 0, lon: -79.9, lat: 43.65 },
      { image_x: 100, image_y: 0, lon: -79.8, lat: 43.65 },
      { image_x: 100, image_y: 100, lon: -79.8, lat: 43.55 },
    ];
    const points: PointToProject[] = [{ image_x: 50, image_y: 50, label: "p" }];
    const fc = projectToGeoJSON(gcps, points);
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(0);
  });

  it("returns one Point feature per point to project with 4 GCPs", () => {
    const gcps: GCP[] = [
      { image_x: 0, image_y: 0, lon: -80, lat: 44 },
      { image_x: 100, image_y: 0, lon: -79, lat: 44 },
      { image_x: 100, image_y: 100, lon: -79, lat: 43 },
      { image_x: 0, image_y: 100, lon: -80, lat: 43 },
    ];
    const points: PointToProject[] = [
      { image_x: 50, image_y: 50, label: "center" },
    ];
    const fc = projectToGeoJSON(gcps, points);
    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].geometry.type).toBe("Point");
    expect(fc.features[0].geometry.coordinates).toHaveLength(2);
    expect(fc.features[0].properties?.name).toBe("center");
    // Center of the quad in image should map to roughly center in lon/lat
    const [lon, lat] = fc.features[0].geometry.coordinates;
    expect(lon).toBeGreaterThan(-80);
    expect(lon).toBeLessThan(-79);
    expect(lat).toBeGreaterThan(43);
    expect(lat).toBeLessThan(44);
  });
});
