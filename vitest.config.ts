import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: ["node_modules", ".next", "dist", "build"],
    setupFiles: "./vitest.setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
