import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@@", replacement: path.resolve(__dirname) },
    ],
  },
});
