# geo-homography

TypeScript-only library for GCP-based homography projection: image coordinates → GeoJSON (lon/lat).

## Install

```bash
npm install
```

## Usage

```ts
import {
  projectToGeoJSON,
  defaultInput,
  type GCP,
  type PointToProject,
  type InputJSON,
} from "geo-homography";

// At least 4 GCPs: image (x,y) + map (lon, lat)
const gcps: GCP[] = [
  { image_x: 100, image_y: 200, lon: -79.92, lat: 43.65 },
  // ...
];

// Points on the image to project to the map
const pointsToProject: PointToProject[] = [
  { image_x: 500, image_y: 300, label: "object1" },
];

const geojson = projectToGeoJSON(gcps, pointsToProject);
// GeoJSON FeatureCollection of Points with properties.name = label
```

## API

- **`projectToGeoJSON(gcps, pointsToProject)`** — Returns a GeoJSON FeatureCollection of Points.
- **`defaultInput()`** — Returns an empty `InputJSON` (for defaults / demos).
- **`getPerspectiveTransform4(src, dst)`** — 4-point DLT homography matrix.
- **`applyHomography(H, x, y)`** — Map image (x,y) to local east/north (m).
- **`localToLonLat(refLon, refLat, eastM, northM)`** — Local meters to lon/lat.

Types: `GCP`, `PointToProject`, `InputJSON`, `HomographyMatrix`.

## Publishing (maintainers)

Releases are published to npm via GitHub Actions when you create a **GitHub Release**:

1. **One-time setup:** In your GitHub repo go to **Settings → Secrets and variables → Actions** and add a secret named `NPM_TOKEN` with an [npm access token](https://www.npmjs.com/settings/~/tokens) (choose “Automation” or “Publish”).
2. Bump the version in `package.json` and commit.
3. Create a new release on GitHub (e.g. tag `v1.0.1`) and publish it. The workflow will build and publish the package to npm.

You can also run the **Publish to npm** workflow manually from the **Actions** tab (`workflow_dispatch`).
