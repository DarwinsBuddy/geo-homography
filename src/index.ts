/**
 * projection-core: TypeScript-only library for GCP-based homography projection.
 * No React, no DOM. Use in any TS/JS codebase.
 *
 * @example
 * import { projectToGeoJSON, type GCP, type PointToProject } from 'projection-core';
 * const geojson = projectToGeoJSON(gcps, pointsToProject);
 */

export type { GCP, PointToProject, InputJSON } from "./types";
export { defaultInput } from "./types";
export {
  getPerspectiveTransform4,
  applyHomography,
  localToLonLat,
  projectToGeoJSON,
  type HomographyMatrix,
} from "./homography";
