import { defineConfig } from "@playwright/test";
import { loadEnv } from "vite";
import { testDatabaseUrl } from "./tests/test-db.ts";

const env = { ...loadEnv("test", process.cwd(), ""), ...process.env };
const port = 5198;

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Tests share the same database
  workers: 1,
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: {
    command: `npx vite dev --port ${port} --strictPort`,
    port,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: testDatabaseUrl(),
      SVELTEKIT_OUT_DIR: ".svelte-kit-e2e",
    },
  },
  metadata: { adminToken: env.ADMIN_TOKEN },
});
