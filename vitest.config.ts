import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

// Vitest only defaults NODE_ENV to "test" when it is unset. A shell that
// exports NODE_ENV=production makes Node resolve React's production CJS build,
// where `React.act` does not exist, and every React Testing Library render
// fails with "React.act is not a function". Running the unit suite against
// production builds is never what we want, so pin it here.
if (process.env.NODE_ENV === "production") {
  process.env.NODE_ENV = "test";
}

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    // Server code is plain Node. Client component tests need a DOM, otherwise
    // React Testing Library fails with "React.act is not a function".
    environment: "node",
    environmentMatchGlobs: [["client/**", "jsdom"]],
    env: { NODE_ENV: "test" },
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "client/**/*.test.ts", "client/**/*.spec.ts"],
    setupFiles: ["./test/vitest.setup.ts"],
  },
});
