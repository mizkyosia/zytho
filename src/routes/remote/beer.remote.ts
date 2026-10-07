import { db } from "#lib/server/db/index.js";
import { beer } from "#lib/server/db/schema.js";
import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import * as v from "valibot";

const beerSchema = v.object({
  name: v.optional(v.string()),
  alcohol: v.optional(v.string()),
  buyingPrice: v.optional(v.number()),
  sellingPrice: v.optional(v.number()),
});

export const allBeers = query(async () => {
  const { locals } = getRequestEvent();
  if (!locals.authorized)
    return error(401, { message: "Veuillez vous authentifier" });

  const beers = await db.select().from(beer);

  return beers;
});

export const editBeer = command(
  v.object({
    id: v.number(),
    ...beerSchema.entries,
  }),
  async ({ id, ...row }) => {
    await db.update(beer).set(row).where(eq(beer.id, id));

    return { success: true };
  },
);

export const addBeer = command(beerSchema, async (row) => {
  let res = await db
    .insert(beer)
    .values({
      name: "",
      alcohol: "0.0",
      buyingPrice: 0,
      sellingPrice: 2.5,
      ...row,
    })
    .returning();

  return res[0];
});

export const deleteBeer = command(v.number(), async (id) => {
  await db.delete(beer).where(eq(beer.id, id));

  return { success: true };
});
