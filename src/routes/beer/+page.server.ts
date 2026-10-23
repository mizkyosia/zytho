import { db } from "#lib/server/db/index.js";
import { beerStocks } from "#lib/server/db/stats.js";

export const load = async () => {
  const beers = await beerStocks(db);

  return { beers };
};
