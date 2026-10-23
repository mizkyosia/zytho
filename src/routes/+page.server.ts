import { db } from "#lib/server/db/index.js";
import {
  beerStocks,
  lastDelivery,
  openedBarrels,
  soldDuringYear,
} from "#lib/server/db/stats.js";

export const load = async ({ locals }) => {
  // The home page is the only one reachable without being logged in
  if (!locals.authorized) return { dashboard: null };

  const year = new Date().getFullYear();
  const [stocks, delivery, barrels, sales] = await Promise.all([
    beerStocks(db),
    lastDelivery(db),
    openedBarrels(db),
    soldDuringYear(db, year),
  ]);

  return { dashboard: { stocks, delivery, barrels, sales, year } };
};
