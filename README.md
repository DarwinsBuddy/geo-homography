# geo-homography

[![CI](https://github.com/DarwinsBuddy/geo-homography/actions/workflows/ci.yml/badge.svg)](https://github.com/DarwinsBuddy/geo-homography/actions/workflows/ci.yml) [![npm version](https://img.shields.io/npm/v/geo-homography.svg)](https://www.npmjs.com/package/geo-homography) [![jsDelivr CDN](https://img.shields.io/jsdelivr/npm/hm/geo-homography)](https://cdn.jsdelivr.net/npm/geo-homography/) [![codecov](https://codecov.io/gh/DarwinsBuddy/geo-homography/graph/badge.svg?token=ACgThwoF6y)](https://codecov.io/gh/DarwinsBuddy/geo-homography)

TypeScript-only library for GCP-based homography projection: image coordinates → GeoJSON (lon/lat).

## Install

```bash
npm install geo-homography
```

### Use from CDN (jsDelivr)

It's automatically available on [jsDelivr](https://www.jsdelivr.com/). Use it from any environment that can load ESM from a URL:

**Exact version (recommended for production):**

```html
<script type="importmap">
{
  "imports": {
    "geo-homography": "https://cdn.jsdelivr.net/npm/geo-homography@1/dist/index.js"
  }
}
</script>
<script type="module">
  import { projectToGeoJSON } from "geo-homography";
  // ...
</script>
```

**Or import directly:**

```js
import { projectToGeoJSON } from "https://cdn.jsdelivr.net/npm/geo-homography@1/dist/index.js";
```

- Replace `@1` with a specific version (e.g. `@1.0.0`) or use `@latest` (not recommended in production).
- CDN root: `https://cdn.jsdelivr.net/npm/geo-homography`

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

Releases are published to npm via GitHub Actions using **trusted publishing (OIDC)**—no long-lived tokens.

1. **One-time setup:** On [npmjs.com](https://www.npmjs.com) go to your package → **Settings** → **Trusted Publisher**. Add a GitHub Actions publisher:
   - **Organization or user:** `DarwinsBuddy`
   - **Repository:** `geo-homography`
   - **Workflow filename:** `publish.yml`
2. Bump the version in `package.json` and commit.
3. Create a new **GitHub Release** (e.g. tag `v1.0.1`) and publish it. The workflow will build and publish to npm using OIDC.

You can also run the **Publish to npm** workflow manually from the **Actions** tab (`workflow_dispatch`).
