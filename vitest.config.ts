import { defineConfig } from "vitest/config";
import path from "path";

// Egen config for tester — vite.config.ts har Lovable-plugins som ikke
// trengs (eller fungerer) i testmiljøet.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
