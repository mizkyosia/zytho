import { db } from "#lib/server/db/index.js";
import { deliverySummaries } from "#lib/server/db/stats.js";

export const load = async () => {
  return {
    deliveries: await deliverySummaries(db),
  };
};
