/**
 * Input/output types for GCP-based projection.
 * Used by projection-core and by consumers (e.g. demo UI).
 */

export interface GCP {
  image_x: number;
  image_y: number;
  lon: number;
  lat: number;
}

export interface PointToProject {
  image_x: number;
  image_y: number;
  label: string;
}

export interface InputJSON {
  image_url: string;
  gcps: GCP[];
  include_camera_view: boolean;
  points_to_project: PointToProject[];
  /** Optional: camera position (lon, lat) to show on the map */
  camera_lon?: number | null;
  camera_lat?: number | null;
}

/** Default input for demos / empty state. */
export function defaultInput(): InputJSON {
  return {
    image_url: "",
    gcps: [],
    include_camera_view: true,
    points_to_project: [],
    camera_lon: -79.9248758,
    camera_lat: 43.6527426,
  };
}
