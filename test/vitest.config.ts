import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    root: "./test",
    include: ["specs/**/*.test.ts"],
    globals: true,
    testTimeout: 30000, // 30s timeout for E2E tests
    hookTimeout: 10000,
    setupFiles: ["./setup.ts"],
    // Run tests sequentially since they share Karabiner state
    pool: "forks",
  },
  // Vitest 4: pool options are now top-level
  forks: {
    singleFork: true,
  },
});
