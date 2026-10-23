import { db } from "#lib/server/db/index.js";
import { beer } from "#lib/server/db/schema.js";
import { requireAuth } from "#lib/server/auth.js";
import { command, query } from "$app/server";
import { eq } from "drizzle-orm";
import * as v from "valibot";

const beerSchema = v.object({
  name: v.optional(v.string()),
  alcohol: v.optional(v.number()),
  buyingPrice: v.optional(v.number()),
});

export const allBeers = query(async () => {
  requireAuth();

  return await db.select().from(beer);
});

export const editBeer = command(
  v.object({
    id: v.number(),
    ...beerSchema.entries,
  }),
  async ({ id, ...row }) => {
    requireAuth();
    await db.update(beer).set(row).where(eq(beer.id, id));

    return { success: true };
  },
);

export const addBeer = command(beerSchema, async (row) => {
  requireAuth();
  let res = await db
    .insert(beer)
    .values({
      name: "",
      alcohol: 0,
      buyingPrice: 0,
      ...row,
    })
    .returning();

  return res[0];
});

export const deleteBeer = command(v.number(), async (id) => {
  requireAuth();
  await db.delete(beer).where(eq(beer.id, id));

  return { success: true };
});
