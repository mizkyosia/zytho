import { db } from "#lib/server/db/index.js";

export const load = async () => {
  const beers = await db.query.beer.findMany();

  return { beers };
};
