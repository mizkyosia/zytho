import { db } from "#lib/server/db/index.js";
import { zythoSummaries } from "#lib/server/db/stats.js";

export const load = async ({ locals }) => {
  if (!locals.authorized) return { zythos: [] };

  return {
    zythos: await zythoSummaries(db),
  };
};
