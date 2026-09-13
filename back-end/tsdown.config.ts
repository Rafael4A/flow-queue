import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  clean: true,
  bundle: true,
  sourcemap: true,
  dts: false,
});
