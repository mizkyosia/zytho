import { execFileSync } from "node:child_process";
import postgres from "postgres";
import { loadEnv } from "vite";

/**
 * URL of the test database : TEST_DATABASE_URL, or the database
 * of DATABASE_URL suffixed with `_test` (on the same server)
 */
export function testDatabaseUrl() {
  const env = { ...loadEnv("test", process.cwd(), ""), ...process.env };
  if (env.TEST_DATABASE_URL) return env.TEST_DATABASE_URL;
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const url = new URL(env.DATABASE_URL);
  url.pathname = url.pathname + "_test";
  return url.toString();
}

/** Creates the test database if needed and pushes the schema to it */
export async function prepareTestDb() {
  const url = testDatabaseUrl();
  const dbName = new URL(url).pathname.slice(1);

  // Connect to the server's default database to create the test one
  const adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";
  const admin = postgres(adminUrl.toString(), { max: 1, onnotice: () => {} });
  const exists = await admin`select 1 from pg_database where datname = ${dbName}`;
  if (exists.length === 0) await admin.unsafe(`create database "${dbName}"`);
  await admin.end();

  execFileSync("npx", ["drizzle-kit", "push", "--force"], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });

  return url;
}
