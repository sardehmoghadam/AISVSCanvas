import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Vitest runs the content-integrity tests against the same TypeScript modules
 * the build uses.
 *
 * The `@/*` alias mirrors the `paths` mapping in `tsconfig.json` so tests can
 * import build-time modules (for example `lib/search.ts`, which reaches
 * `@/components/*` through the content loader) without rewriting imports.
 *
 * The `.mts` extension keeps this file ESM; the repo stays CommonJS for
 * `postcss.config.js` and friends.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(fileURLToPath(new URL(".", import.meta.url))),
    },
  },
});
