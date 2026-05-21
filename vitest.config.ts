import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // The `server-only` package throws at import time outside of an RSC
      // build. We don't need that protection in unit tests — alias it to a
      // tiny shim so server-fetch modules can be exercised directly.
      "server-only": fileURLToPath(
        new URL("./lib/test/server-only.shim.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
});
