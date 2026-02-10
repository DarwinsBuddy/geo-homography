import { defineConfig } from "vite";
import { resolve } from "path";

const minify = process.env.MINIFY === "true";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GeoHomography",
      fileName: () => (minify ? "geo-homography.min.js" : "index.js"),
      formats: ["es"],
    },
    minify: minify ? "esbuild" : false,
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: false, // avoid wiping dist between the two builds (keeps .d.ts)
    rollupOptions: {
      external: [],
    },
  },
});
