import { describe, it, expect } from "vitest";
import { defaultInput } from "./types";

describe("defaultInput", () => {
  it("returns object with empty image_url and gcps", () => {
    const input = defaultInput();
    expect(input.image_url).toBe("");
    expect(input.gcps).toEqual([]);
  });

  it("returns include_camera_view true and empty points_to_project", () => {
    const input = defaultInput();
    expect(input.include_camera_view).toBe(true);
    expect(input.points_to_project).toEqual([]);
  });

  it("returns default camera lon/lat", () => {
    const input = defaultInput();
    expect(input.camera_lon).toBe(-79.9248758);
    expect(input.camera_lat).toBe(43.6527426);
  });
});
