import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  DATABASE_URL: {},
  ADMIN_TOKEN: {},
  PG_USER: {},
  PG_DATABASE: {},
  PG_PASSWORD: {},
});
